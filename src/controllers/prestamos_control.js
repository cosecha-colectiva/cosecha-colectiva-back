import db from "../../config/database";
import { catch_common_error, existe_grupo, existe_prestamo, obtener_acuerdo_actual, obtener_sesion_activa, prestamos_multiples } from "../funciones_js/validaciones";

export const enviar_socios_prestamo = async (req, res) => {
    const { Grupo_id } = req.body;
    if (!Grupo_id) {
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    let query = "SELECT * FROM grupo_socio WHERE Grupo_id = ?";
    const [socios] = await db.query(query, [Grupo_id]); // [[...resultados], [...campos]]
    console.log(prestamos_multiples(socios));
    const socios_prestamos = await prestamos_multiples(socios);
    if (socios_prestamos.length > 0){
        return res.json({ code: 200, message: 'Socios obtenidos', data: socios_prestamos }).status(200);
    }else{
        return res.json({ code: 500, message: 'Error en el servidor'}).status(500);
    }
    
}

export const crear_prestamo = (req, res) => {
    const campos_prestamo = {
        // Socio_id: req.body.Socio_id,
        // Sesion_id: req.body.Sesion_id,
        // Acuerdos_id: req.body.Acuerdos_id,
        // Prestamo_original_id: req.body.Prestamo_original_id,
        // Monto_prestamo: req.body.Monto_prestamo,
        // Monto_pagado: req.body.Monto_pagado,
        // Interes_generado: req.body.Interes_generado,
        // Interes_pagado: req.body.Interes_pagado,
        // Fecha_inicial: req.body.Fecha_inicial,
        // Fecha_final: req.body.Fecha_final,
        // Estatus_ampliacion: req.body.Estatus_ampliacion,
        // Observaciones: req.body.Observaciones,
        // Num_sesiones: req.body.Num_sesiones,
        // Sesiones_restantes: req.body.Sesiones_restantes,
        // Estatus_prestamo: req.body.Estatus_prestamo,

        Lista_socios: req.body.Lista_socios // [{Socio_id}]
    };

    //campos incompletos
    if (campos_incompletos(campos_prestamo)) {
        res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    // Validaciones
        //Verificar si se permiten prestamos multiples
            //si no, verificar si no tiene ningun otro prestamo
        //verificar cantidad maxima que puede pedir el socio (cantidad de dinero en acciones * Limite credito de acuerdos)
        //Calcular el monto acumulado en prestamos vigentes (si esta cantidad rebasa su limite no puede proceder)
        //Verificar si hay esa cantidad disponible en la caja
    
    // Crear Registro en prestamos
 
    // Registrar salida de dinero de la caja de la sesion

    // Crear la transaccion de tipo "PRESTAMO"
}

const obtener_caja_sesion = async (Sesion_id) => {
    let query = "Select Caja from Sesion_id = ?";
    return (await db.query(query, Sesion_id))[0][0]?.Caja;
}

const obtener_prestamo = async (Prestamo_id) => {
    let query = "Select * from prestamos where Prestamo_id = ?";
    return (await db.query(query, Prestamo_id))[0][0];
}

const obtener_grupo_por_sesion = async (Sesion_id) => {
    let query = "SELECT grupos.* FROM grupos JOIN sesiones ON sesiones.Grupo_id = grupos.Grupo_id WHERE sesiones.Sesion_id = ?";
    return (await db.query(query, Sesion_id))[0][0];
}

const pagar_prestamo = async (Prestamo_id, Monto_abono_prestamo, Monto_abono_interes, Sesion_id) => {
    // Crear transaccion en la base de datos:
    const connection = await db.getConnection()
    await connection.beginTransaction()
    .then(() => {
        const prestamo = await obtener_prestamo(Prestamo_id);
        const grupo = await obtener_grupo_por_sesion(Sesion_id);
        let query;
        
        // Crear registro en Transacciones
        const campos_transacciones = {
            Cantidad_movimiento: Monto_abono_prestamo + Monto_abono_interes,
            Caja: await obtener_caja_sesion(Sesion_id),
            Sesion_id,
            Socio_id: prestamo.Socio_id,
            Acuerdo: await obtener_acuerdo_actual(grupo.Grupo_id)
        }
        query = ""

        // Crear registro en Transaccion_prestamos
        query = "INSERT INTO transaccion_prestamos (Prestamo_id, Transaccion_id, Monto_abono_prestamo, Monto_abono_interes) VALUES (?, ?, ?, ?)";
        await db.query(query, [Prestamo_id, ])
    })
    .then(() => {await connection.commit()})
    .catch((error) => {
        await connection.rollback();
        throw error;
    })


        // dividir lo que le corresponde a interes y cuanto a prestamo

    // Actualizar campos en el prestamo
        //Interes pagado        
        //Monto_pagado
            //Si esta completo cambiar estatus del prestamo
        //Sesiones restantes
    
    
    // Actualizar caja

}

export const pagar_prestamos = async (req, res) => {
    const {Grupo_id, Prestamos} = req.body; // {Grupo_id = 1, Prestamos: [{Prestamo_id: 1, Monto_abono_prestamo: 15, Monto_abono_interes: 10}, {...}, ...]}
    
    try {
        // Validaciones generales
        await existe_grupo(Grupo_id);
        const sesion_activa = await obtener_sesion_activa(Grupo_id);
        const acuerdo_actual = await obtener_acuerdo_actual(Grupo_id);

        const prestamos_con_error = [];
        Prestamos.forEach((pago_prestamo) => {
            try {
                const {Prestamo_id, Monto_abono_interes, Monto_abono_prestamo} = pago_prestamo;

                const prestamo = await obtener_prestamo(Prestamo_id);
                
                // Crear registro en "Transacciones"
                const campos_transaccion = {
                    Cantidad_movimiento: Monto_abono_prestamo + Monto_abono_interes,
                    Caja: sesion_activa.Caja + this.Cantidad_movimiento,
                    Sesion_id: sesion_activa.Sesion_id,
                    Socio_id: prestamo.Socio_id,
                    Acuerdo_id: acuerdo_actual.Acuerdo_id,
                    Catalogo_id: "ABONO_PRESTAMO"
                }
            } catch (error) {
                const {message} = catch_common_error(error);
                prestamos_con_error.push({Prestamo_id: pago_prestamo.Prestamo_id, motivo: message});
            }
        });
    } catch (error) {
        catch_common_error(error);
    }
}

// export const ampliar_prestamo = (req, res) => {
//     // Recibir Datos
    
//     // Validaciones

//     // Crear nuevo prestamo

//     // Pagar el anterior
//         //mostrar cuanto 

//     // Registrar las transacciones

//     // Actualizar la caja
// }