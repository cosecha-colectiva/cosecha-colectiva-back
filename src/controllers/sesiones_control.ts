import db from "../config/database";
import { Fecha_actual, campos_incompletos, existe_grupo, catch_common_error, obtener_sesion_activa, existe_socio, socio_en_grupo } from "../utils/validaciones";
import { obtenerSesionActual, registrar_asistencias } from "../services/Sesiones.services";
import { AdminRequest } from "../types/misc";
import { getCommonError } from "../utils/utils";
import { asignarGananciasSesion } from "../services/Ganancias.services";

//crear nueva sesion
export const crear_sesion = async (req: AdminRequest<{ Socios: { "Socio_id": number, "Presente": 1 | 0 }[] }>, res) => {
    const Socios = req.body.Socios;
    const Grupo_id = req.id_grupo_actual;

    const campos_sesion = {
        Fecha: Fecha_actual(),
        Caja: null,
        Acciones: null,
        Grupo_id
    }

    if (campos_incompletos(campos_sesion)) {
        return res.json({ code: 400, message: 'campos incompletos' }).status(400);
    }

    try {

        //Verificar si es por lo menos el 50% de asistencia
        //extraer numero de socios
        let query_s = "SELECT * FROM grupo_socio WHERE Grupo_id = ?";
        // const [socios_grupo] = await db.query(query_s, [grupo.Grupo_id]) as [GrupoSocio[], any];
        const [socios_grupo] = await db.query(query_s, [Grupo_id]) as [GrupoSocio[], any];

        //Contar cuantos estan presentes
        let contador_socios = 0;
        Socios.forEach(socio => {
            if (socio.Presente === 1) {
                contador_socios++;
            }
        });

        let minimo_asistencia = Math.ceil(socios_grupo.length / 2);
        if (contador_socios < minimo_asistencia) {
            return res.status(400).json({ code: 400, message: 'Necesitas minimo el 50% de la asistencia para iniciar una sesión' });
        }

        // obtener caja Y ACCIONES final de la sesion anterior
        let query = "SELECT Caja, Acciones FROM sesiones WHERE Grupo_id = ? ORDER BY Fecha desc, Sesion_id desc LIMIT 1";
        const [sesiones] = await db.query(query, [Grupo_id]);
        campos_sesion.Caja = sesiones[0] ? sesiones[0].Caja : 0;
        campos_sesion.Acciones = sesiones[0] ? sesiones[0].Acciones : 0;

        // desactivar todas las sesiones que puedan estar activas para ese grupo
        query = "Update sesiones set Activa = 0 where Grupo_id = ?";
        await db.query(query, Grupo_id);

        // crear la nueva sesion
        query = "INSERT INTO sesiones SET ?";
        await db.query(query, campos_sesion);

        registrar_asistencias(Grupo_id, Socios);
        return res.json({ code: 200, message: 'Sesion creada y asistencias registradas' }).status(200);
    } catch (error) {
        console.log(error);
        const { code, message } = catch_common_error(error);
        return res.json({ code, message }).status(code);
    }
}


//Obtener inasistencias de la sesion
export const enviar_inasistencias_sesion = async (req, res) => {
    const { Grupo_id } = req.body;

    //comprobar que haya Sesion_id y Socios
    if (!Grupo_id) {
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    // Validar si la sesion existe y tiene permiso
    try {
        const sesion = await obtener_sesion_activa(Grupo_id);

        let query = "SELECT socios.Nombres, socios.Apellidos, socios.Socio_id FROM asistencias JOIN socios ON asistencias.Socio_id = socios.Socio_id WHERE asistencias.Presente = 0 AND asistencias.Sesion_id = ?";
        const [inasistencias] = (await db.query(query, [sesion.Sesion_id]));

        return res.json({ code: 200, message: 'Inasistencias obtenidas', data: inasistencias }).status(200);
    } catch (error) {
        const { code, message } = catch_common_error(error);
        return res.json({ code, message }).status(code);
    }
}


//Registrar retardos
export const registrar_retardos = async (req, res) => {
    const { id_grupo_actual: Grupo_id } = req;
    const { Retardos: Socios } = req.body;

    //comprobar que haya Sesion_id y Socios
    if (!Grupo_id || !Socios) {
        // campos incompletos
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    try {
        // VERIFICACIONES
        // Verificar que la sesion existe
        const sesion = await obtener_sesion_activa(Grupo_id);

        //registrar Retardos
        const retardos_con_error: { Socio_id: number, error: string }[] = [];
        for (let i = 0; i < Socios.length; i++) {
            try {
                // Verificar que el socio existe
                const socio = await existe_socio(Socios[i]);
                // Verificar que el socio pertenezca al grupo
                await socio_en_grupo(socio.Socio_id, Grupo_id);

                // INSERCION
                let query = "UPDATE asistencias SET Presente = 2 WHERE Sesion_id = ? AND Socio_id = ? AND Presente != 1";
                await db.query(query, [sesion.Sesion_id, Socios[i]]);
            } catch (error) {
                const { message } = catch_common_error(error)
                retardos_con_error.push({
                    Socio_id: Socios[i],
                    error: message
                });
            }
        }

        if (retardos_con_error.length > 0) {
            return res.json({ code: 400, message: 'Retardos con error', data: retardos_con_error }).status(400);
        }

        return res.json({ code: 200, message: 'Retardos registrados' }).status(200);
    } catch (error) {
        const { code, message } = catch_common_error(error);
        return res.json({ code, message }).status(code);
    }
}

export const finalizar_sesion = async (req: AdminRequest<any>, res) => {
    // TODO: Subir las imagenes de las firmas de los socios a AWS S3

    const { id_grupo_actual } = req;

    const con = await db.getConnection();
    try {
        await con.beginTransaction();

        const sesionActual = await obtenerSesionActual(id_grupo_actual!);

        let query = "UPDATE sesiones SET Activa = 0 WHERE Sesion_id = ?";
        await con.query(query, sesionActual.Sesion_id);
        
        asignarGananciasSesion(id_grupo_actual!, {sesionActual}, con);

        await con.commit();

        return res.status(200).json({ code: 200, message: 'Sesion finalizada' });

    } catch (error) {
        await con.rollback();

        const { code, message } = getCommonError(error);
        return res.json({ code, message }).status(code);
    } finally {
        con.release();
    }
}