import { Fecha_actual, campos_incompletos, existe_grupo, socio_en_grupo, catch_common_error, tiene_permiso } from '../funciones_js/validaciones';

import db from "../../config/database";

// funcion para crear acuerdos
export const crear_acuerdos = async (req, res) => { //
    const body = req.body;
    const {id_socio_actual} = req;
    const campos_acuerdo = {
        Grupo_id: body.Grupo_id,
        Fecha_acuerdos: Fecha_actual(),
        Fecha_acuerdos_fin: body.Fecha_acuerdos_fin,
        Periodo_reuniones: body.Periodo_reuniones,
        Periodo_cargos: body.Periodo_cargos,
        Limite_inasistencias: body.Limite_inasistencias,
        Minimo_aportacion: body.Minimo_aportacion,
        Costo_acciones: body.Costo_acciones,
        Tasa_interes: body.Tasa_interes,
        Limite_credito: body.Limite_credito,
        Porcentaje_fondo_comun: body.Porcentaje_fondo_comun,
        Creditos_simultaneos: body.Creditos_simultaneos,
        Interes_morosidad: body.Interes_morosidad,
        Ampliacion_prestamos: body.Ampliacion_prestamos, // true o false
        Interes_ampliacion: body.Ampliacion_prestamos == "1" ? body.Interes_ampliacion : null, // si ampliacion prestamos... agrega interes ampliacion
        Mod_calculo_interes: body.Mod_calculo_interes,
        Tasa_interes_prestamo_grande: body.Tasa_interes_prestamo_grande,
        Id_socio_administrador: body.Id_socio_administrador,
        Id_socio_administrador_suplente: body.Id_socio_administrador_suplente,
    };

    if (campos_incompletos(campos_acuerdo)) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    let query = "select * from grupo_socio where Socio_id = ? and grupo_id = ?";
    let [[socio_grupo]] = await db.query(query, [id_socio_actual, campos_acuerdo.Grupo_id]);

    console.log("iniciando validaciones")
    Promise.all([ // Validaciones de formas asincronas
        existe_grupo(campos_acuerdo.Grupo_id),
        socio_en_grupo(campos_acuerdo.Id_socio_administrador, campos_acuerdo.Grupo_id),
        socio_en_grupo(campos_acuerdo.Id_socio_administrador_suplente, campos_acuerdo.Grupo_id),
        (socio_grupo.Tipo_socio === "CREADOR") ? Promise.resolve() : tiene_permiso(id_socio_actual, campos_acuerdo.Grupo_id),
    ])
    .then(async ([]) => {
        console.log("validaciones terminadas");
        const conn = await db.getConnection();
        await conn.beginTransaction(); 
        console.log("transaccion creada");
            
        try {    
            // Actualizar status del acuerdo anterior
            let query = "UPDATE acuerdos SET Status = 0 WHERE Grupo_id = ? and Status = 1";
            await conn.query(query, [campos_acuerdo.Grupo_id]);
            console.log("Terminando primera consulta");
            // Crear el registro
            query = "INSERT INTO acuerdos SET ?";
            await conn.query(query, [campos_acuerdo]);
            
            // Cambiar el socio de Creador, admin y suplente a normal
            query = "UPDATE grupo_socio SET Tipo_socio = 'SOCIO' WHERE Grupo_id = ? AND (Tipo_socio = 'CREADOR' or Tipo_socio = 'ADMIN' or Tipo_socio = 'SUPLENTE')";
            await conn.query(query, [campos_acuerdo.Grupo_id]);
            
            // Actualizar tipo socio a administrador
            query = "UPDATE grupo_socio SET Tipo_socio = 'ADMIN' WHERE Grupo_id = ? AND Socio_id = ?";
            await conn.query(query, [campos_acuerdo.Grupo_id, campos_acuerdo.Id_socio_administrador]);
            
            // Actualizar tipo socio a Suplente
            query = "UPDATE grupo_socio SET Tipo_socio = 'SUPLENTE' WHERE Grupo_id = ? AND Socio_id = ?";
            await conn.query(query, [campos_acuerdo.Grupo_id, campos_acuerdo.Id_socio_administrador_suplente]);
            
            // Hacer commit en la bd
            await conn.commit();
            console.log("Haciendo commit");
            
            return res.status(200).json({ code: 200, message: "Acuerdo registrado correctamente" });
        } catch (error) {
            await conn.rollback();
            throw Error();
        }

        conn.release();
    })
    .catch((error) => {
        const {message, code} = catch_common_error(error);
        return res.status(code).json({code, message});
    })

    console.log("Ya estoy libre");
}

//funcion para crear acuerdo secundario
export const crear_acuerdo_secundario = async (req, res) => {
    const campos_acuerdo_secundario = {
        Grupo_id: req.body.Grupo_id,
        Regla: req.body.Regla,
        Acuerdo: req.body.Acuerdo,
        Fecha_acuerdo: Fecha_actual(),
        Fecha_acuerdo_fin: req.body.Fecha_acuerdo_fin,
        Status: 1
    }

    // Verificar que los campos esten completos
    if (campos_incompletos(campos_acuerdo_secundario)) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        // Verificar que el grupo existe
        await existe_grupo(campos_acuerdo_secundario.Grupo_id);

        // verificar que el socio tiene permiso
        await tiene_permiso(req.body.id_socio_actual, campos_acuerdo_secundario.Grupo_id);

        let query = "INSERT INTO acuerdos_secundarios SET ?";
        await db.query(query, [campos_acuerdo_secundario]);

        return res.status(200).json({ code: 200, message: "Acuerdo secundario registrado correctamente" });

    } catch (error) {
        if (typeof (error) == "string") {
            // enviar mensaje de error
            return res.status(400).json({ code: 400, message: error });
        }

        console.log(error);
        return res.status(500).json({ code: 500, message: 'Error en el servidor' });
    }
}
