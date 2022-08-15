import db from "../config/database";
import { existe_prestamo, prestamo_es_pagable } from "../services/Prestamos.services";
import { crear_transaccion } from "../services/Transacciones.services";
import { getCommonError } from "../utils/utils";
import { obtener_caja_sesion, obtener_sesion_activa } from "../services/Sesiones.services";
import { obtener_acuerdo_actual } from "../services/Acuerdos.services";
import { prestamos_multiples, campos_incompletos, Fecha_actual, obtener_acuerdos_activos } from "../utils/validaciones";
import { AdminRequest } from "../types/misc";
import { existeGrupo } from "../services/Grupos.services";

export const enviar_socios_prestamo = async (req, res) => {
    const { Grupo_id } = req.body;
    if (!Grupo_id) {
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    let query = "SELECT * FROM grupo_socio WHERE Grupo_id = ?";
    const [socios] = await db.query(query, [Grupo_id]) as [GrupoSocio[], any];
    console.log(prestamos_multiples(Grupo_id, socios));
    const socios_prestamos = await prestamos_multiples(Grupo_id, socios);
    if (socios_prestamos.length > 0) {
        return res.json({ code: 200, message: 'Socios obtenidos', data: socios_prestamos }).status(200);
    } else {
        return res.json({ code: 500, message: 'Error en el servidor' }).status(500);
    }
}

interface PayloadCrearPrestamos {
    Lista_socios: {
        Socio_id: number,
        cantidad_prestamo: number,
        fecha_probable: string,
        num_sesiones: number,
        observaciones: string
    }[];
}
export const crear_prestamo = async (req: AdminRequest<PayloadCrearPrestamos>, res) => {
    const campos_prestamo = {
        Grupo_id: req.id_grupo_actual!,
        Lista_socios: req.body.Lista_socios 
    };

    //campos incompletos
    if (campos_incompletos(campos_prestamo)) {
        res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    // Recibir todos los campos del prestamo
    // si campos_prestamo.Estatus_ampliacion = 0:
        // verificar que se pueda crear el prestamo
        // Crear un nuevo prestamo
    // si campos_prestamo.Estatus_ampliacion = 1, entonces ampliar el prestamo
        // verificar que se pueda ampliar el prestamo
        // pagar el prestamo original
        // crear el nuevo prestamo

    //Existe el grupo
    //Obtener la sesion activa
    let Sesion_id = await obtener_sesion_activa(campos_prestamo.Grupo_id);
    //Buscar los acuerdos activos
    let acuerdos_activos = await obtener_acuerdos_activos(campos_prestamo.Grupo_id);
    //Generar la fecha de hoy
    let fecha = Fecha_actual();

    let prestamos_con_error: { Socio_id: number, motivo: string }[] = [];
    let Lista_socios_permiso: { Socio_id: number, Limite_credito_disponible: number }[] = [];

    //Se crea una lista para poder hacer las validaciones
    let Lista_socios_query: GrupoSocio[] = [];
    for (let i = 0; i < campos_prestamo.Lista_socios.length; i++) {
        try {
            let query = "SELECT * FROM grupo_socio WHERE Grupo_id = ? AND Socio_id = ?";
            const socio = (await db.query(query, [campos_prestamo.Grupo_id, campos_prestamo.Lista_socios[i].Socio_id]))[0][0] as GrupoSocio;
            Lista_socios_query.push(socio);
        } catch {
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
        if (socio.puede_pedir) {
            Lista_socios_permiso.push({ "Socio_id": socio.Socio_id, "Limite_credito_disponible": socio.Limite_credito_disponible! })
        } else {
            prestamos_con_error.push({ Socio_id: socio.Socio_id, motivo: "No cumple con los requisitos el solicitante" });
        }
    });
    //Verificar que la cantidad que solicita no sobrepase su limite
    campos_prestamo.Lista_socios.forEach(async (socio_general) => {
        Lista_socios_permiso.forEach(async (socio_permiso) => {
            if (socio_general.Socio_id == socio_permiso.Socio_id) {
                if (socio_general.cantidad_prestamo <= socio_permiso.Limite_credito_disponible) {
                    //Verificar si hay esa cantidad disponible en la caja
                    //Obtener la caja de la sesion activa
                    let caja = await obtener_caja_sesion(Sesion_id);
                    if (caja >= socio_permiso.Limite_credito_disponible) {
                        // Crear Registro en prestamos
                        let query = "INSERT INTO prestamos (Socio_id, Sesion_id, Acuerdo_id, Monto_prestamo, Fecha_inicial, Fecha_final, Observaciones, Num_sesiones, Sesiones_restantes, Estatus_prestamo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        await db.query(query, [socio_permiso.Socio_id, Sesion_id, acuerdos_activos.Acuerdo_id, socio_general.cantidad_prestamo, fecha, socio_general.fecha_probable, socio_general.observaciones, socio_general.num_sesiones, socio_general.num_sesiones, 0]);
                        // Registrar salida de dinero de la caja de la sesion
                        let caja_nueva = caja - socio_general.cantidad_prestamo;
                        query = "Update sesiones set caja = ? where Sesion_id = ?";
                        await db.query(query, [caja_nueva, Sesion_id]);
                        // Crear la transaccion de tipo "PRESTAMO"
                        let query2 = "Insert into transacciones SET ?";
                        //const resultado_registro_transaccion = (await con.query(query2, campos_transaccion))[0] as OkPacket;

                    } else {
                        prestamos_con_error.push({ Socio_id: socio_permiso.Socio_id, motivo: "No hay suficiente cantidad en la caja" });
                    }
                } else {
                    prestamos_con_error.push({ Socio_id: socio_permiso.Socio_id, motivo: "La cantidad solicitada rebasa su limite de credito" });
                }
            }
        }
        );

    });


}

export interface PayloadPagarPrestamos {
    Prestamos: {
        Prestamo_id: number,
        Monto_abono_prestamo: number,
        Monto_abono_interes: number
    }[]
}
export const pagar_prestamos = async (req: AdminRequest<PayloadPagarPrestamos>, res) => {
    const Grupo_id = req.id_grupo_actual!;
    const { Prestamos } = req.body;

    try {
        // Validaciones generales
        await existeGrupo(Grupo_id);
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
                await prestamo_es_pagable(prestamo);

                if (prestamo.Interes_generado >= prestamo.Interes_pagado + Monto_abono_interes) {
                    throw `Lo abonado al interés (${Monto_abono_interes}) es mayor que la deuda por interés (${prestamo.Interes_generado - prestamo.Interes_pagado})`;
                }
                if (prestamo.Monto_prestamo >= prestamo.Monto_pagado + Monto_abono_prestamo) {
                    throw `Lo abonado al prestamo (${Monto_abono_prestamo}) es mayor que la deuda por prestamo (${prestamo.Monto_prestamo - prestamo.Monto_pagado})`;
                }

                // Crear Transaccion
                const transaccion = await crear_transaccion({
                    Cantidad_movimiento: Monto_abono_prestamo + Monto_abono_interes,
                    Caja: sesion_activa.Caja + Monto_abono_prestamo + Monto_abono_interes,
                    Sesion_id: sesion_activa.Sesion_id!,
                    Socio_id: prestamo.Socio_id,
                    Acuerdo_id: acuerdo_actual.Acuerdo_id!,
                    Catalogo_id: "ABONO_PRESTAMO"
                }, con);

                // Crear registro en Transaccion_prestamos
                let query = "INSERT INTO transaccion_prestamos (Prestamo_id, Transaccion_id, Monto_abono_prestamo, Monto_abono_interes) VALUES (?, ?, ?, ?)";
                await con.query(query, [Prestamo_id, transaccion.Transaccion_id, Monto_abono_prestamo, Monto_abono_interes]);

                // Actualizar campos en el prestamo
                prestamo.Interes_pagado += Monto_abono_interes;
                prestamo.Monto_pagado += Monto_abono_prestamo;
                prestamo.Estatus_prestamo = prestamo.Interes_generado === prestamo.Interes_generado && prestamo.Monto_pagado === prestamo.Monto_prestamo ? 1 : prestamo.Estatus_prestamo;

                query = "Update prestamos SET ? where Prestamo_id = ?";
                await con.query(query, [prestamo, Prestamo_id]);

                // Hacer commit en la base de datos
                await con.commit();
            } catch (error) {
                await con.rollback();
                const { message } = getCommonError(error);
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
        const { code, message } = getCommonError(error);
        return res.status(code).json({ code, message });
    }
}