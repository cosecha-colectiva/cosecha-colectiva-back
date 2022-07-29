import { Request, Response } from "express";
import { OkPacket, RowDataPacket } from "mysql2";
import db from "../config/database";
import { CustomRequest } from "../types/misc";
import { existe_prestamo, prestamo_pagable } from "../services/Prestamos.services";
import { campos_incompletos, catch_common_error, existe_grupo, obtener_acuerdo_actual, obtener_sesion_activa, prestamos_multiples, obtener_acuerdos_activos, Fecha_actual } from "../utils/validaciones";

export const enviar_socios_prestamo = async (req, res) => {
    const { Grupo_id } = req.body;
    if (!Grupo_id) {
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    let query = "SELECT * FROM grupo_socio WHERE Grupo_id = ?";
    const [socios] = await db.query(query, [Grupo_id]); // [[...resultados], [...campos]]
    console.log(prestamos_multiples(socios));
    const socios_prestamos = await prestamos_multiples(socios);
    if (socios_prestamos.length > 0) {
        return res.json({ code: 200, message: 'Socios obtenidos', data: socios_prestamos }).status(200);
    } else {
        return res.json({ code: 500, message: 'Error en el servidor' }).status(500);
    }

}

export const crear_prestamo = async (req, res) => {
    const campos_prestamo = {
        Grupo_id: req.body.Grupo_id,
        Lista_socios: req.body.Lista_socios // [{Socio_id, cantidad_prestamo, fecha_probable, num_sesiones, observaciones}]
    };

    //campos incompletos
    if (campos_incompletos(campos_prestamo)) {
        res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }
    
    //Existe el grupo
    //Obtener la sesion activa
    let Sesion_id = await obtener_sesion_activa(campos_prestamo.Grupo_id);
    //Buscar los acuerdos activos
    let acuerdos_activos = await obtener_acuerdos_activos(campos_prestamo.Grupo_id);
    //Generar la fecha de hoy
    let fecha = Fecha_actual();

    let prestamos_con_error : { Socio_id: number, motivo: string }[] = [];
    let Lista_socios_permiso: { Socio_id: number, Limite_credito_disponible : number}[] = [];

    //Se crea una lista para poder hacer las validaciones
    let Lista_socios_query : GrupoSocio[] = [];
    for(let i = 0; i < campos_prestamo.Lista_socios.length; i++){
        try{
            let query = "SELECT * FROM grupo_socio WHERE Grupo_id = ? AND Socio_id = ?";
            const socio = (await db.query(query, [campos_prestamo.Grupo_id, campos_prestamo.Lista_socios[i].Socio_id]))[0][0] as GrupoSocio;
            Lista_socios_query.push(socio);
        }catch{
            return false; //cambiar a tipo error
        }
        
    }
    // Validaciones
        //Verificar si se permiten prestamos multiples
            //si no, verificar si no tiene ningun otro prestamo
        //verificar cantidad maxima que puede pedir el socio (cantidad de dinero en acciones * Limite credito de acuerdos)
        //Calcular el monto acumulado en prestamos vigentes (si esta cantidad rebasa su limite no puede proceder)
        let Lista_socios_validacion = await prestamos_multiples(campos_prestamo.Grupo_id, Lista_socios_query);
    
        Lista_socios_validacion.forEach(socio => {
            if(socio.puede_pedir){
                Lista_socios_permiso.push({ "Socio_id": socio.Socio_id, "Limite_credito_disponible" : socio.Limite_credito_disponible!})
            }else{
                prestamos_con_error.push({ Socio_id: socio.Socio_id, motivo: "No cumple con los requisitos el solicitante" });
            }
        });
    //Verificar que la cantidad que solicita no sobrepase su limite
    campos_prestamo.Lista_socios.forEach(async(socio_general) =>{
        Lista_socios_permiso.forEach(async(socio_permiso) =>
            {
                if(socio_general.Socio_id == socio_permiso.Socio_id ){
                    if(socio_general.cantidad_prestamo <= socio_permiso.Limite_credito_disponible ){
                        //Verificar si hay esa cantidad disponible en la caja
                            //Obtener la caja de la sesion activa
                            let caja = await obtener_caja_sesion(Sesion_id);
                        if(caja >= socio_permiso.Limite_credito_disponible){
                            // Crear Registro en prestamos
                            let query = "INSERT INTO prestamos (Socio_id, Sesion_id, Acuerdos_id, Monto_prestamo, Fecha_inicial, Fecha_final, Observaciones, Num_sesiones, Sesiones_restantes, Estatus_prestamo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                            await db.query(query, [socio_permiso.Socio_id, Sesion_id, acuerdos_activos.Acuerdos_id, socio_general.cantidad_prestamo, fecha, socio_general.fecha_probable, socio_general.observaciones, socio_general.num_sesiones, socio_general.num_sesiones, 0]);
                            // Registrar salida de dinero de la caja de la sesion
                            let caja_nueva = caja - socio_general.cantidad_prestamo;
                            query = "Update sesiones set caja = ? where Sesion_id = ?";
                            await db.query(query, [caja_nueva, Sesion_id]);
                            // Crear la transaccion de tipo "PRESTAMO"
                            let query2 = "Insert into transacciones SET ?";
                            //const resultado_registro_transaccion = (await con.query(query2, campos_transaccion))[0] as OkPacket;

                        }else{
                            prestamos_con_error.push({ Socio_id: socio_permiso.Socio_id, motivo: "No hay suficiente cantidad en la caja" });
                        }
                    }else{
                        prestamos_con_error.push({ Socio_id: socio_permiso.Socio_id, motivo: "La cantidad solicitada rebasa su limite de credito" });
                    }
                }
            }
        );
        
    });

    
}

const obtener_caja_sesion = async (Sesion_id) => {
    let query = "Select Caja from sesiones WHERE Sesion_id = ? AND Activa = 1"; //creo que esta incompleta jaja
    return (await db.query(query, Sesion_id))[0][0]?.Caja;
}

interface PayloadPagarPrestamos {
    Grupo_id: number,
    Prestamos: {
        Prestamo_id: number,
        Monto_abono_prestamo: number,
        Monto_abono_interes: number
    }[]
}

export const pagar_prestamos = async (req: CustomRequest<PayloadPagarPrestamos>, res: Response) => {
    const { Grupo_id, Prestamos } = req.body;

    try {
        // Validaciones generales
        await existe_grupo(Grupo_id);
        const sesion_activa = await obtener_sesion_activa(Grupo_id);
        const acuerdo_actual = await obtener_acuerdo_actual(Grupo_id);

        const prestamos_con_error: { Prestamo_id: number, motivo: string }[] = [];
        Prestamos.forEach(async (pago_prestamo) => {
            // iniciar transaction con la DB
            const con = await db.getConnection();
            await con.beginTransaction();

            try {
                const { Prestamo_id, Monto_abono_interes, Monto_abono_prestamo } = pago_prestamo;
                const prestamo = await existe_prestamo(Prestamo_id) as Prestamo;
                await prestamo_pagable(prestamo);

                if (prestamo.Interes_generado >= prestamo.Interes_pagado + Monto_abono_interes) {
                    throw `Lo abonado al interés (${Monto_abono_interes}) es mayor que la deuda por interés (${prestamo.Interes_generado - prestamo.Interes_pagado})`;
                }
                if (prestamo.Monto_prestamo >= prestamo.Monto_pagado + Monto_abono_prestamo) {
                    throw `Lo abonado al prestamo (${Monto_abono_prestamo}) es mayor que la deuda por prestamo (${prestamo.Monto_prestamo - prestamo.Monto_pagado})`;
                }

                // Crear registro en "Transacciones"
                const campos_transaccion = {
                    Cantidad_movimiento: Monto_abono_prestamo + Monto_abono_interes,
                    Caja: sesion_activa.Caja + Monto_abono_prestamo + Monto_abono_interes,
                    Sesion_id: sesion_activa.Sesion_id,
                    Socio_id: prestamo!.Socio_id,
                    Acuerdo_id: acuerdo_actual.Acuerdo_id,
                    Catalogo_id: "ABONO_PRESTAMO"
                }

                let query = "Insert into transacciones SET ?";
                const resultado_registro_transaccion = (await con.query(query, campos_transaccion))[0] as OkPacket;

                // Actualizar caja
                query = "Update sesiones set caja = ? where Sesion_id = ?";
                await con.query(query, [campos_transaccion.Caja, campos_transaccion.Sesion_id]);

                // Crear registro en Transaccion_prestamos
                query = "INSERT INTO transaccion_prestamos (Prestamo_id, Transaccion_id, Monto_abono_prestamo, Monto_abono_interes) VALUES (?, ?, ?, ?)";
                await con.query(query, [Prestamo_id, resultado_registro_transaccion.insertId, Monto_abono_prestamo, Monto_abono_interes]);

                // Actualizar campos en el prestamo
                prestamo.Interes_pagado += Monto_abono_interes;
                prestamo.Monto_pagado += Monto_abono_prestamo;
                prestamo.Estatus_prestamo = prestamo.Interes_generado === prestamo.Interes_generado && prestamo.Monto_pagado === prestamo.Monto_prestamo ? 1 : prestamo.Estatus_prestamo;

                query = "Update prestamos SET ? where Prestamo_id = ?";
                await con.query(query, [{
                    InteresPagado: prestamo.Interes_pagado,
                    Monto_pagado: prestamo.Monto_pagado,
                    Estatus_prestamo: prestamo.Estatus_prestamo
                },
                    Prestamo_id]);

                // Hacer commit en la base de datos
                await con.commit();
            } catch (error) {
                await con.rollback();
                const { message } = catch_common_error(error);
                prestamos_con_error.push({ Prestamo_id: pago_prestamo.Prestamo_id, motivo: message });
            }
            finally {
                con.destroy();
            }
        });

        // enviar respuesta al cliente
        if (prestamos_con_error.length > 0) {
            return res.status(400).json({ code: 400, message: "Hay prestamos con error", data: prestamos_con_error });
        }
        return res.status(200).json({ code: 200, message: "Todas los prestamos fueron pagados" });
    } catch (error) {
        const { code, message } = catch_common_error(error);
        return res.status(code).json({ code, message });
    }
}