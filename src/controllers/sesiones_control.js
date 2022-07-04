import { campos_incompletos, existe_grupo, existe_sesion, existe_socio, Fecha_actual, socio_en_grupo } from "../funciones_js/validaciones";

const db = require("../../config/database");

//crear nueva sesion
export const crear_sesion = async (req, res) => {
    const campos_sesion = {
        Fecha: Fecha_actual(),
        Grupo_id: req.body.Grupo_id,
        Caja: null
    }

    if (campos_incompletos(campos_sesion)) {
        res.json({ code: 400, message: 'No se envio el id del grupo' }).status(400);
    }

    try {
        //VERIFICAR QUE EXISTE EL GRUPO
        const grupo = existe_grupo(campos_sesion.Grupo_id);

        // obtener caja final de la sesion anterior
        let query = "SELECT Caja FROM sesiones WHERE Grupo_id = ? ORDER BY Fecha DESC LIMIT 1";
        const sesiones = await db.query(query, [grupo.Grupo_id]);
        campos_sesion.Caja = sesiones[0] ? sesiones[0].Caja : 0;

        query = "INSERT INTO sesiones SET ?";
        db.query(query, campos_sesion);

        return res.json({ code: 200, message: 'Sesion creada' }).status(200);
    } catch (error) {
        if (typeof (error) == "string") {
            // enviar mensaje de error
            return res.status(400).json({ code: 400, message: error });
        }

        console.log(error);
        return res.status(500).json({ code: 500, message: 'Error en el servidor' });
    }
}

// registrar asistencias de un grupo
//recibe el id de la sesion y un array de json con {Socio_id, Presente}
export const registrar_asistencias = async (req, res) => {
    const { Sesion_id, Socios } = req.body;

    //comprobar que haya Sesion_id y Socios
    if (!Sesion_id || !Socios) {
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    //registrar asistencias
    const asistencias_con_error = [];
    for (let i = 0; i < Socios.length; i++) {
        try {
            // VERIFICACIONES
            // Verificar que la sesion existe
            const sesion = await existe_sesion(Sesion_id);
            // Verificar que el socio existe
            const socio = await existe_socio(Socios[i].Socio_id);
            // Verificar que el socio pertenezca al grupo
            await socio_en_grupo(socio.Socio_id, sesion.Grupo_id);

            // INSERCION
            let query = "INSERT INTO asistencias (Presente, Sesion_id, Socio_id) VALUES (?, ?, ?)";
            await db.query(query, [Socios[i].Presente, Sesion_id, Socios[i].Socio_id]);
        } catch (error) {
            asistencias_con_error.push({
                Socio_id: Socios[i].Socio_id,
                error: (typeof (error) === "string") ?
                    error :
                    "Error del servidor"
            });
        }
    }

    if (asistencias_con_error.length > 0) {
        return res.json({ code: 400, message: 'Asistencias con error', data: asistencias_con_error }).status(400);
    }

    return res.json({ code: 200, message: 'Asistencias registradas' }).status(200);
}

//Obtener inasistencias de la sesion
export const enviar_inasistencias_sesion = async (req, res) => {
    const { Sesion_id } = req.body;

    //comprobar que haya Sesion_id y Socios
    if (!Sesion_id) {
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    // Validar si la sesion existe
    try {
        await existe_sesion(Sesion_id);
    } catch (error) {
        return res.json({ code: 400, message: 'No hay una sesion con ese Id' }).status(400);
    }

    //buscar los registros con el id de la sesion y de los socios
    try {
        let query = "CALL obtener_inasistencias_sesion(?)";
        const retardos = (await db.query(query, [Sesion_id]))[0];
        return res.json({ code: 200, message: 'Retardos obtenidos', data: retardos }).status(200);
    } catch (err) {
        return res.json({ code: 500, message: 'Error al obtener retardos' }).status(500);
    }
}


//Registrar retardos
export const registrar_retardos = async (req, res) => {

    const { Sesion_id, Socios } = req.body;

    //comprobar que haya Sesion_id y Socios
    if (!Sesion_id || !Socios) {
        // campos incompletos
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    //registrar Retardos
    const retardos_con_error = [];
    for (let i = 0; i < Socios.length; i++) {
        try {
            // VERIFICACIONES
            // Verificar que la sesion existe
            const sesion = await existe_sesion(Sesion_id);
            // Verificar que el socio existe
            const socio = await existe_socio(Socios[i]);
            // Verificar que el socio pertenezca al grupo
            await socio_en_grupo(socio.Socio_id, sesion.Grupo_id);

            // INSERCION
            let query = "UPDATE asistencias SET Presente = 2 WHERE Sesion_id = ? AND Socio_id = ? AND Presente != 1";
            await db.query(query, [Sesion_id, Socios[i]]);
        } catch (error) {
            retardos_con_error.push({
                Socio_id,
                error: (typeof (error) === "string") ?
                    error :
                    "Error del servidor"
            });
        }
    }

    if (retardos_con_error.length > 0) {
        return res.json({ code: 400, message: 'Retardos con error', data: retardos_con_error }).status(400);
    }

    return res.json({ code: 200, message: 'Retardos registrados' }).status(200);
}
