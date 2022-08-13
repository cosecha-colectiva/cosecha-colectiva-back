import { OkPacket, RowDataPacket } from "mysql2";
import db from "../config/database";
import { existeGrupo, grupoVacio } from "./Grupos.services";

/**
 * Funcion para verificar si un socio es administrador de un grupo.
 * 
 * @param Socio_id id del socio a verificar.
 * @param Grupo_id id del grupo a verificar.
 * @returns true si el socio es administrador del grupo
 * @throws Si ocurre un error.
 * @throws Si el socio no existe.
 * @throws Si el grupo no existe.
 * @throws Si el socio no es administrador del grupo.
 */
export const socio_es_admin = async (Socio_id: number, Grupo_id: number) => {
    // Verificar que el socio existe
    await existe_socio(Socio_id);
    // Verificar que el grupo existe
    await existeGrupo(Grupo_id);

    // Consultar si el socio es administrador del grupo
    const query = "SELECT * FROM grupo_socio WHERE grupo_socio.Grupo_id = ? AND grupo_socio.Socio_id = ? AND grupo_socio.Tipo_socio = 'ADMIN'";
    const [rows] = (await db.query(query, [Grupo_id, Socio_id]) as [GrupoSocio[], any]);
    
    // Si el socio no es administrador del grupo, lanzar error
    if (rows.length === 0) {
        throw "El socio no es administrador del grupo";
    }

    return true;
}

/**
 * Funcion para agregar un socio a un grupo.
 * 
 * @param Socio_id id del socio que agrega al grupo.
 * @param Codigo_grupo codigo del grupo al que se agrega el socio.
 * @throws Si ocurre un error.
 */
export async function agregarSocioGrupo(Socio_id: number, Codigo_grupo: string) {
    const grupo = await existeGrupo(Codigo_grupo);

    let query = "SELECT * FROM grupo_socio WHERE Socio_id = ? AND Grupo_id = ?";
    const [grupo_socio] = await db.query(query, [Socio_id, grupo.Grupo_id]) as [GrupoSocio[], any];

    // Si el socio está activo o congelado en el grupo
    if (grupo_socio.length > 0 && grupo_socio[0].Status != 0) {
        throw "El socio ya está en el grupo";
    }

    // Si el socio no está inactivo, activarlo
    if (grupo_socio.length > 0 && grupo_socio[0].Status == 0) {
        query = "UPDATE grupo_socio SET Status = 1 WHERE Socio_id = ? AND Codigo_grupo = ?";
        return await db.query(query, [Socio_id, Codigo_grupo]);
    }

    // agregar el socio al grupo
    const campos_grupo_socio: GrupoSocio = {
        Tipo_socio: await grupoVacio(grupo.Grupo_id!) ? "ADMIN" : "SOCIO",
        Grupo_id: grupo.Grupo_id!,
        Socio_id: Socio_id
    };

    query = "INSERT INTO grupo_socio SET ?";
    return (await db.query(query, [campos_grupo_socio]) as [OkPacket, any])[0];
}

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