import { Response } from "express";
import db from "../config/database";
import { comprar_acciones, obtener_costo_accion } from "../services/Acciones.services";
import { obtenerAcuerdoActual } from "../services/Acuerdos.services";
import { existeGrupo } from "../services/Grupos.services";
import { obtenerSesionActual } from "../services/Sesiones.services";
import { existeSocio, obtenerLimiteCreditoDisponible, socioEnGrupo } from "../services/Socios.services";
import { crear_transaccion } from "../services/Transacciones.services";
import { AdminRequest } from "../types/misc";
import { camposIncompletos, getCommonError } from "../utils/utils";

export const registrar_compra_acciones = async (req: AdminRequest<{ Cantidad: number }>, res: Response) => {
    const Grupo_id = Number(req.params.Grupo_id);
    const Socio_id = Number(req.params.Socio_id);
    const { Cantidad } = req.body;

    if (camposIncompletos({ Cantidad })) {
        return res.status(400).json({ error: "Campos incompletos" });
    }

    let con = await db.getConnection();
    try {
        con.beginTransaction();

        // Validar que el socio exista
        const socio = await existeSocio(Socio_id);
        // Validar que el grupo exista
        const grupo = await existeGrupo(Grupo_id);
        // Validar que el socio pertenezca al grupo
        const grupoSocio = await socioEnGrupo(Socio_id, Grupo_id);
        // Validar que haya una sesion activa
        const sesionActual = await obtenerSesionActual(Grupo_id);

        // comprobar que el socio no vaya a tener mas del 50% de las acciones del grupo
        if (grupoSocio.Acciones! + Cantidad > (sesionActual.Acciones + Cantidad) / 2) {
            return res.status(400).json({ error: "El socio no puede tener mas del 50% de las acciones del grupo" });
        }

        // Verificar que la cantidad sea divisible por el costo de una accion
        const costo_accion = await obtener_costo_accion(Grupo_id);
        if (Cantidad % costo_accion !== 0) {
            throw `La cantidad de acciones no es divisible por el costo de una accion(${costo_accion})`;
        }

        // Comprar acciones
        comprar_acciones(Socio_id, Grupo_id, Cantidad, con);

        con.commit();
        return res.status(200).json({ code: 200, message: "Acciones compradas" });
    } catch (error) {
        con.rollback();
        const { code, message } = getCommonError(error);
        return res.status(code).json({ code, message });
    } finally {
        con.release();
    }
}

export const retiro_acciones = async (req: AdminRequest<{ Cantidad: number }>, res: Response) => {
    const Grupo_id = Number(req.params.Grupo_id);
    const Socio_id = Number(req.params.Socio_id);
    const { Cantidad } = req.body;

    if (camposIncompletos({ Cantidad })) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    let con = await db.getConnection();
    try {
        con.beginTransaction();

        // Validar que el socio exista
        const socio = await existeSocio(Socio_id);

        // Validar que el socio pertenezca al grupo
        const grupoSocio = await socioEnGrupo(Socio_id, Grupo_id);

        const acuerdoActual = await obtenerAcuerdoActual(Grupo_id);

        // Validar que el socio tenga mas acciones que las que quiere retirar y sea mayor al minimo de aportacion
        if (grupoSocio.Acciones! - Cantidad < acuerdoActual.Minimo_aportacion) {
            return res.status(400).json({ code: 400, message: `El socio no puede retirar esa cantidad de acciones. Tiene ${grupoSocio.Acciones} acciones y el minimo de aportacion es ${acuerdoActual.Minimo_aportacion}` });
        }

        // Validar que las acciones no est??n comprometidas en algun prestamo
        const limiteCreditoDisponible = await obtenerLimiteCreditoDisponible(Socio_id, Grupo_id); // limite de credito total - cantidad ocupada en prestamos
        if (limiteCreditoDisponible <= Cantidad) {
            return res.status(400).json({ code: 400, message: "El socio est?? ocupando esas acciones en prestamos" });
        }

        // Retirar la accion a la relacion socio-grupo
        let query = "UPDATE grupo_socio SET acciones = acciones - ? WHERE Socio_id = ? AND Grupo_id = ?";
        await con.query(query, [Cantidad, Socio_id, Grupo_id]);

        // Actualizar la cantidad de acciones del grupo en la sesion
        query = `UPDATE sesiones
        SET Acciones = Acciones - ?
        WHERE Grupo_id = ?
        AND Activa = 1`;
        await con.query(query, [Cantidad, Grupo_id]);

        // Registrar la transaccion (cantidad_movimiento es negativo)
        await crear_transaccion({
            Cantidad_movimiento: -Cantidad,
            Catalogo_id: "RETIRO_ACCION",
            Socio_id,
            Grupo_id,
        }, con);

        con.commit();
        return res.status(200).json({ code: 200, message: "Acciones retiradas" });
    } catch (error) {
        con.rollback();
        const { code, message } = getCommonError(error);
        return res.status(code).json({ code, message });
    } finally {
        con.release();
    }
}

export const enviar_costo_acciones = async (req: AdminRequest<any>, res: Response) => {
    const Grupo_id = Number(req.params.Grupo_id);

    try {
        const acuerdoActual = await obtenerAcuerdoActual(Grupo_id);
        return res.status(200).json({ code: 200, message: "Costo de acciones", data: { Costo: acuerdoActual.Costo_acciones } });
    } catch (error) {
        const { code, message } = getCommonError(error);
        return res.status(code).json({ code, message });        
    }
}