import db from "../config/database";

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