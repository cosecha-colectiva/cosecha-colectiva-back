import db from "../config/database";

/**
 * Devuelve un grupo en base al id o codigo del grupo.
 * @param identificador Puede ser el id o el codigo del grupo
 * @returns Objeto de tipo Grupo. TROWS COMMON ERROR
 */
export const existe_grupo = async (identificador: number | string) => {
    let query = "SELECT * FROM grupos WHERE Codigo_grupo = ? or Grupo_id = ?";
    const grupo = (await db.query(query, [identificador, identificador]))[0][0] as Grupo;

    if (grupo !== undefined) {
        return grupo;
    }

    throw "No existe el Grupo con el id o codigo: " + identificador;
};