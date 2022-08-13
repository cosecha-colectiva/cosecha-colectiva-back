import { RowDataPacket } from "mysql2";
import db from "../config/database";
import { existe_grupo, existe_socio } from "./validaciones"

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
