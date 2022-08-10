import db from "../config/database";
import { existe_grupo } from "./Grupos.services";

/**
 * Funcion para verificar que el socio exista
 * @param Socio_id id del socio a verificar
 * @returns Objeto con el socio si existe
 * @throws Error si ocurre un error
 * @throws Error si el socio no existe
 */
export const existe_socio = async (Socio_id: number) => {
    const query = "SELECT * FROM Socios WHERE Socio_id = ?";
    const [socios] = await db.query(query, Socio_id) as [Socio[], any];

    if (socios.length === 0) {
        throw "El socio no existe";
    }

    return socios[0];
}

/**
 * Funcion para verificar si un socio es administrador de un grupo.
 * 
 * @param Socio_id id del socio a verificar.
 * @param Grupo_id id del grupo a verificar.
 * @throws Si ocurre un error.
 * @throws Si el socio no existe.
 * @throws Si el grupo no existe.
 * @throws Si el socio no es administrador del grupo.
 */
export const socio_es_admin = async (Socio_id: number, Grupo_id: number) => {
    // Verificar que el socio existe
    existe_socio(Socio_id);
    // Verificar que el grupo existe
    existe_grupo(Grupo_id);

    // Consultar si el socio es administrador del grupo
    const query = "SELECT * FROM grupo_socio WHERE grupo_socio.Grupo_id = ? AND grupo_socio.Socio_id = ? AND grupo_socio.Tipo_socio = 'ADMIN'";
    const [rows] = (await db.query(query, [Socio_id, Grupo_id]) as [GrupoSocio[], any]);

    // Si el socio no es administrador del grupo, lanzar error
    if (rows.length === 0) {
        throw "El socio no es administrador del grupo";
    }
}
