import db from "../config/database";
import { existeGrupo } from "./Grupos.services";
import { existe_socio } from "./Socios.services";

/**
 * Busca un prestamo en base a su id.
 * @param Prestamo_id Id del prestamo a obtener.
 * @returns Objeto de tipo Prestamo o nada, si no lo encuentra.
 */
export const obtener_prestamo = async (Prestamo_id: number): Promise<Prestamo | undefined> => {
    let query = "Select * from prestamos where Prestamo_id = ?";
    return (await db.query(query, Prestamo_id))[0][0];
}

/**
 * Busca un prestamo en base a su id.
 * @param Prestamo_id Id del prestamo a obtener.
 * @returns Objeto de tipo Prestamo. THROWS COMMON ERROR.
 */
export const existe_prestamo = async (Prestamo_id: number): Promise<Prestamo> => {
    const prestamo = await obtener_prestamo(Prestamo_id);
    if (prestamo !== undefined) return prestamo;

    throw "No existe el prestamo con el id " + Prestamo_id;
}

/**
 * Determina si un prestamo es pagable o no.
 * @param Prestamo Puede ser el id del prestamo, o un objeto tipo prestamo.
 * @returns Retorna true si el prestamo es pagable. Si no es pagable TRHOWS COMMON ERROR.
 */
export const prestamo_es_pagable = async (Prestamo: number | Prestamo): Promise<boolean> => {
    if (typeof Prestamo === "number") {
        Prestamo = await existe_prestamo(Prestamo) as Prestamo;
    }

    if (Prestamo.Estatus_prestamo !== 0)
        throw "El prestamo con id " + Prestamo.Prestamo_id + " no es pagable (estatus = 0). Estatus: " + Prestamo.Estatus_prestamo;

    return true;
}

/**
 * Funcion para obtener prestamos ampliabes de un socio en un grupo.
 * @param Grupo_id Id del grupo.
 * @param Socio_id Id del socio.
 * @returns Array de objetos de tipo Prestamo.
 * @throws Error si no existe el socio o el grupo.
 */
export const obtener_prestamos_ampliables = async (Grupo_id: number, Socio_id: number): Promise<Prestamo[]> => {
    const socio = await existe_socio(Socio_id);
    const grupo = await existeGrupo(Grupo_id);

    const query = `
    SELECT prestamos.*
    FROM prestamos
    JOIN sesiones ON prestamos.Sesion_id = sesiones.Sesion_id
    JOIN grupos ON grupos.Grupo_id = sesiones.Grupo_id
    JOIN acuerdos ON acuerdos.Grupo_id = grupos.Grupo_id
    WHERE prestamos.Estatus_ampliacion = 0 -- Que no estén ampliados ya
        AND prestamos.Estatus_prestamo = 0 -- Que no estén pagados
        AND grupos.Grupo_id = ? -- De cierto grupo
        AND prestamos.Socio_id = ? -- De cierto socio
        AND acuerdos.Ampliacion_prestamos = 1 -- Que los acuerdos lo permitan;
    `;

    return (await db.query(query, [Grupo_id, Socio_id]) as [Prestamo[], any])[0];
}

/**
 * Funcion para obtener prestamos pagables de un socio en un grupo.
 * @param Grupo_id Id del grupo.
 * @param Socio_id Id del socio.
 * @returns Array de objetos de tipo Prestamo.
 * @throws Error si no existe el socio o el grupo.
 */
export const obtener_prestamos_pagables = async (Grupo_id: number, Socio_id: number): Promise<Prestamo[]> => {
    const socio = await existe_socio(Socio_id);
    const grupo = await existeGrupo(Grupo_id);

    const query = `
    SELECT prestamos.*
    FROM prestamos
    JOIN sesiones ON prestamos.Sesion_id = sesiones.Sesion_id
    JOIN grupos ON grupos.Grupo_id = sesiones.Grupo_id
    JOIN acuerdos ON acuerdos.Grupo_id = grupos.Grupo_id
    WHERE prestamos.Estatus_prestamo = 0 -- Que no estén pagados ya
        AND grupos.Grupo_id = ? -- De cierto grupo
        AND prestamos.Socio_id = ? -- De cierto socio
    `;

    return (await db.query(query, [Grupo_id, Socio_id]) as [Prestamo[], any])[0];
}