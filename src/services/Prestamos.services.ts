import db from "../config/database";

export const obtener_prestamo = async (Prestamo_id: number): Promise<Prestamo | undefined> => {
    let query = "Select * from prestamos where Prestamo_id = ?";
    return (await db.query(query, Prestamo_id))[0][0];
}

export const existe_prestamo = async (Prestamo_id: number): Promise<Prestamo | Error> => {
    const prestamo = await obtener_prestamo(Prestamo_id);
    if (prestamo !== undefined) return prestamo;

    throw "No existe el prestamo con el id " + Prestamo_id;
}

export const prestamo_pagable = async (Prestamo: number | Prestamo): Promise<boolean | Error> => {
    if (typeof Prestamo === "number") {
        Prestamo = await existe_prestamo(Prestamo) as Prestamo;
    }

    if (Prestamo.Estatus_prestamo === 0) return true;

    throw "El prestamo con id " + Prestamo.Prestamo_id + " no es pagable (estatus = 0). Estatus: " + Prestamo.Estatus_prestamo;
}