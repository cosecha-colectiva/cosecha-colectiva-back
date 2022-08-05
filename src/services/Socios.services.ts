import { RowDataPacket } from "mysql2";
import db from "../config/database";

/**
 * Comprueba si un socio existe en la base de datos.
 * @param Socio Objeto de tipo Socio o id del socio.
 * @returns Objeto de tipo Socio.
 * @throws Si no existe el socio.
 */
export const existe_socio = async (Socio: Socio | number): Promise<Socio> => {
    // Asegurarse de que Socio es numero
    if (typeof Socio !== "number") {
        Socio = Socio.Socio_id!;
    }

    const socio = (await db.query("SELECT * FROM socios WHERE Socio_id = ?", [Socio]) as [RowDataPacket[], any])[0][0] as Socio | undefined;

    if (socio !== undefined) {
        return socio;
    }

    throw `No existe el Socio con el id: ${Socio}`;
}

/**
 * Regresa una lista de Grupos de los que el socio es miembro.
 * @param Socio Objeto de tipo Socio o id del socio.
 * @returns Array de objetos de tipo Grupo.
 */
export const grupos_del_socio = async (Socio: Socio | number): Promise<Grupo[]> => {
    // Asegurarse de que Socio es numero
    if (typeof Socio !== "number") {
        Socio = Socio.Socio_id!;
    }

    return (await db.query(`
    SELECT *
    FROM grupos
    JOIN grupo_socio ON grupo_socio.Grupo_id = grupos.Grupo_id
    WHERE grupo_socio.Socio_id = ?
    `, [Socio]) as [RowDataPacket[], any])[0].map((row) => row as Grupo);
}

/**
 * Comprueba si el socio pertenece al grupo.
 * @param Socio Objeto de tipo Socio o id del socio.
 * @param Grupo Objeto de tipo Grupo o id del grupo.
 * @returns Objeto de tipo GrupoSocio.
 * @throws Si el socio no pertenece al grupo.
 */
export const socio_en_grupo = async (Socio: Socio | number, Grupo: Grupo | number) => {
    // Asegurarse de que Socio es numero
    if (typeof Socio !== "number") {
        Socio = Socio.Socio_id!;
    }
    // Asegurarse de que Grupo es numero
    if (typeof Grupo !== "number") {
        Grupo = Grupo.Grupo_id!;
    }

    const result = (await db.query("SELECT * FROM grupo_socio WHERE Socio_id = ? and Grupo_id = ?", [Socio, Grupo]) as [RowDataPacket[], any])[0];

    if (result.length === 0) {
        throw "El socio no pertenece al grupo";
    }

    return result[0] as GrupoSocio;
}