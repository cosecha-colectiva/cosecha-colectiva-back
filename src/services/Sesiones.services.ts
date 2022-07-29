import db from "../config/database";

/**
 * Obtiene la sesion activa de un grupo si es que hay una.
 * @param Grupo_id Id del grupo que tiene la sesion
 * @returns Un objeto de tipo Sesion. TRHOWS COMMON ERROR
 */
export const obtener_sesion_activa = async (Grupo_id: number) => {
    let query = "SELECT * FROM sesiones WHERE sesiones.Activa = TRUE AND sesiones.Grupo_id = ? ORDER BY sesiones.Sesion_id DESC LIMIT 1";
    const sesion = (await db.query(query, Grupo_id))[0][0] as Sesion;

    if (sesion !== undefined) {
        return sesion;
    }

    throw { code: 400, message: "No hay una sesion en curso para el grupo " + Grupo_id };
}