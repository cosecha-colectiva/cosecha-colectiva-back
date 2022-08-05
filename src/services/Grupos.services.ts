import { RowDataPacket } from "mysql2";
import db from "../config/database";

/**
 * Devuelve un grupo en base al id o codigo del grupo.
 * @param identificador Puede ser el id o el codigo del grupo
 * @returns Objeto de tipo Grupo.
 * @throws Si no existe el grupo.
 */
export const existe_grupo = async (identificador: number | string) => {
    let query = "SELECT * FROM grupos WHERE Codigo_grupo = ? or Grupo_id = ?";
    const grupo = (await db.query(query, [identificador, identificador]))[0][0] as Grupo;

    if (grupo !== undefined) {
        return grupo;
    }

    throw "No existe el Grupo con el id o codigo: " + identificador;
};

/**
 * Devuelve los codigos de los grupos a los que no pertenece el socio.
 * @param Socio Objeto de tipo Socio o id del socio.
 * @returns Array de numeros con los codigos de los grupos.
 */
export const grupos_sin_socio = async (Socio: Socio | number): Promise<number[]> => {
    // Asegurarse de que Socio es numero
    if (typeof Socio !== "number") {
        Socio = Socio.Socio_id!;
    }

    return (await db.query(`
    SELECT * 
    FROM grupos 
    WHERE grupos.Grupo_id NOT IN (
        SELECT grupo_socio.Grupo_id 
        FROM grupo_socio
        WHERE grupo_socio.Socio_id = ?
    )
    `, [Socio]) as [RowDataPacket[], any])[0].map((row: RowDataPacket) => row.Codigo_grupo);
}