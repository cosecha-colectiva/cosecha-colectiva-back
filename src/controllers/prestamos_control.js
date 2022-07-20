const db = require("../../config/database");
// const {  } = require("../funciones_js/validaciones");

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

        Lista_socios: req.body.Lista_socios
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

// export const pagar_prestamo = (req, res) => {
//     // Validaciones

//     // Actualizar campos en el prestamo
//         //Monto_pagado
//             //Si esta completo cambiar estatus del prestamo
//         //Interes pagado
//         //Sesiones restantes
    
//     // Crear registro en Transacciones
    
//     // Crear registro en Transaccion_prestamos
            //dividir lo que le corresponde a interes y cuanto a prestamo

//     // Actualizar caja

// }

// export const ampliar_prestamo = (req, res) => {
//     // Recibir Datos
    
//     // Validaciones

//     // Crear nuevo prestamo

//     // Pagar el anterior
//         //mostrar cuanto 

//     // Registrar las transacciones

//     // Actualizar la caja
// }