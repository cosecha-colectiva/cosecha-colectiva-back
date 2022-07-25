import { Response } from "express";
import db from "../config/database";
import { CustomRequest } from "../types/misc";
import { existe_prestamo, prestamo_pagable } from "../services/Prestamos.services";
import { crear_transaccion } from "../services/Transacciones.services";
import { getCommonError } from "../utils/utils";
import { existe_grupo } from "../services/Grupos.services";
import { obtener_sesion_activa } from "../services/Sesiones.services";
import { obtener_acuerdo_actual } from "../services/Acuerdos.services";
import { campos_incompletos, catch_common_error, prestamos_multiples } from "../utils/validaciones";

export const enviar_socios_prestamo = async (req, res) => {
    const { Grupo_id } = req.body;
    if (!Grupo_id) {
        return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
    }

    let query = "SELECT * FROM grupo_socio WHERE Grupo_id = ?";
    const [socios] = await db.query(query, [Grupo_id]); // [[...resultados], [...campos]]
    console.log(prestamos_multiples(socios));
    const socios_prestamos = await prestamos_multiples(socios);
    if (socios_prestamos.length > 0) {
        return res.json({ code: 200, message: 'Socios obtenidos', data: socios_prestamos }).status(200);
    } else {
        return res.json({ code: 500, message: 'Error en el servidor' }).status(500);
    }

}

export const crear_prestamo = (req, res) => {
    const campos_prestamo = {
        // Socio_id: req.body.Socio_id,
        // Sesion_id: req.body.Sesion_id,
        // Acuerdos_id: req.body.Acuerdos_id,
        // Prestamo_original_id: req.body.Prestamo_original_id,
        // Monto_prestamo: req.body.Monto_prestamo,
        // Monto_pagado: req.body.Monto_pagado,
        // Interes_generado: req.body.Interes_generado,
        // Interes_pagado: req.body.Interes_pagado,
        // Fecha_inicial: req.body.Fecha_inicial,
        // Fecha_final: req.body.Fecha_final,
        // Estatus_ampliacion: req.body.Estatus_ampliacion,
        // Observaciones: req.body.Observaciones,
        // Num_sesiones: req.body.Num_sesiones,
        // Sesiones_restantes: req.body.Sesiones_restantes,
        // Estatus_prestamo: req.body.Estatus_prestamo,

        Lista_socios: req.body.Lista_socios // [{Socio_id}]
    };

    //campos incompletos
    if (campos_incompletos(campos_prestamo)) {
        res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    // Validaciones
    //Verificar si se permiten prestamos multiples
    //si no, verificar si no tiene ningun otro prestamo
    //verificar cantidad maxima que puede pedir el socio (cantidad de dinero en acciones * Limite credito de acuerdos)
    //Calcular el monto acumulado en prestamos vigentes (si esta cantidad rebasa su limite no puede proceder)
    //Verificar si hay esa cantidad disponible en la caja

    // Crear Registro en prestamos

    // Registrar salida de dinero de la caja de la sesion

    // Crear la transaccion de tipo "PRESTAMO"
}

interface PayloadPagarPrestamos {
    Grupo_id: number,
    Prestamos: {
        Prestamo_id: number,
        Monto_abono_prestamo: number,
        Monto_abono_interes: number
    }[]
}

export const pagar_prestamos = async (req: CustomRequest<PayloadPagarPrestamos>, res: Response) => {
    const { Grupo_id, Prestamos } = req.body;

    try {
        // Validaciones generales
        await existe_grupo(Grupo_id);
        const sesion_activa = await obtener_sesion_activa(Grupo_id);
        const acuerdo_actual = await obtener_acuerdo_actual(Grupo_id);

        const prestamos_con_error: { Prestamo_id: number, motivo: string }[] = [];
        Prestamos.forEach(async (pago_prestamo) => {
            // iniciar transaction con la DB
            const con = await db.getConnection();
            await con.beginTransaction();

            try {
                const { Prestamo_id, Monto_abono_interes, Monto_abono_prestamo } = pago_prestamo;
                const prestamo = await existe_prestamo(Prestamo_id) as Prestamo;
                await prestamo_pagable(prestamo);

                if (prestamo.Interes_generado >= prestamo.Interes_pagado + Monto_abono_interes) {
                    throw `Lo abonado al interés (${Monto_abono_interes}) es mayor que la deuda por interés (${prestamo.Interes_generado - prestamo.Interes_pagado})`;
                }
                if (prestamo.Monto_prestamo >= prestamo.Monto_pagado + Monto_abono_prestamo) {
                    throw `Lo abonado al prestamo (${Monto_abono_prestamo}) es mayor que la deuda por prestamo (${prestamo.Monto_prestamo - prestamo.Monto_pagado})`;
                }

                // Crear Transaccion
                const transaccion = await crear_transaccion({
                    Cantidad_movimiento: Monto_abono_prestamo + Monto_abono_interes,
                    Caja: sesion_activa.Caja + Monto_abono_prestamo + Monto_abono_interes,
                    Sesion_id: sesion_activa.Sesion_id!,
                    Socio_id: prestamo.Socio_id,
                    Acuerdo_id: acuerdo_actual.Acuerdo_id!,
                    Catalogo_id: "ABONO_PRESTAMO"
                }, con);

                // Crear registro en Transaccion_prestamos
                let query = "INSERT INTO transaccion_prestamos (Prestamo_id, Transaccion_id, Monto_abono_prestamo, Monto_abono_interes) VALUES (?, ?, ?, ?)";
                await con.query(query, [Prestamo_id, transaccion.Transaccion_id, Monto_abono_prestamo, Monto_abono_interes]);

                // Actualizar campos en el prestamo
                prestamo.Interes_pagado += Monto_abono_interes;
                prestamo.Monto_pagado += Monto_abono_prestamo;
                prestamo.Estatus_prestamo = prestamo.Interes_generado === prestamo.Interes_generado && prestamo.Monto_pagado === prestamo.Monto_prestamo ? 1 : prestamo.Estatus_prestamo;

                query = "Update prestamos SET ? where Prestamo_id = ?";
                await con.query(query, [prestamo, Prestamo_id]);

                // Hacer commit en la base de datos
                await con.commit();
            } catch (error) {
                await con.rollback();
                const { message } = getCommonError(error);
                prestamos_con_error.push({ Prestamo_id: pago_prestamo.Prestamo_id, motivo: message });
            }
            finally {
                con.destroy();
            }
        });

        // enviar respuesta al cliente
        if (prestamos_con_error.length > 0) {
            return res.status(400).json({ code: 400, message: "Hay prestamos con error", data: prestamos_con_error });
        }
        return res.status(200).json({ code: 200, message: "Todas los prestamos fueron pagados" });
    } catch (error) {
        return res.json(getCommonError(error));
    }
}