import { OkPacket } from "mysql2";
import db from "../config/database";
import { existeGrupo, grupoVacio } from "./Grupos.services";

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
    existeGrupo(Grupo_id);

    // Consultar si el socio es administrador del grupo
    const query = "SELECT * FROM grupo_socio WHERE grupo_socio.Grupo_id = ? AND grupo_socio.Socio_id = ? AND grupo_socio.Tipo_socio = 'ADMIN'";
    const [rows] = (await db.query(query, [Socio_id, Grupo_id]) as [GrupoSocio[], any]);

    // Si el socio no es administrador del grupo, lanzar error
    if (rows.length === 0) {
        throw "El socio no es administrador del grupo";
    }
}

/**
 * Funcion para agregar un socio a un grupo.
 * 
 * @param Socio_id id del socio que agrega al grupo.
 * @param Codigo_grupo codigo del grupo al que se agrega el socio.
 * @throws Si ocurre un error.
 */
export async function agregarSocioGrupo(Socio_id: number, Codigo_grupo: string) {
    let query = "SELECT * FROM grupo_socio WHERE Socio_id = ? AND Codigo_grupo = ?";
    const [grupo_socio] = await db.query(query, [Socio_id, Codigo_grupo]) as [GrupoSocio[], any];

    // Si el socio está activo o congelado en el grupo
    if (grupo_socio.length > 0 && grupo_socio[0].Status != 0) {
        throw "El socio ya está en el grupo";
    }

    // Si el socio no está inactivo, activarlo
    if (grupo_socio.length > 0 && grupo_socio[0].Status == 0) {
        query = "UPDATE grupo_socio SET Status = 1 WHERE Socio_id = ? AND Codigo_grupo = ?";
        await db.query(query, [Socio_id, Codigo_grupo]);
    }

    // agregar el socio al grupo
    const campos_grupo_socio: GrupoSocio = {
        Tipo_socio: await grupoVacio(grupo_socio[0].Grupo_id) ? "ADMIN" : "SOCIO",
        Grupo_id: grupo_socio[0].Grupo_id,
        Socio_id: Socio_id
    };

    query = "INSERT INTO grupo_socio SET ?";
    return (await db.query(query, [campos_grupo_socio]) as [OkPacket, any])[0];
}