const db = require("../../config/database");
const { existe_grupo, socio_en_grupo, existe_socio, existe_sesion, existe_multa, obtener_acuerdo_actual, campos_incompletos, obtener_sesion_activa, catch_common_error } = require("../funciones_js/validaciones");

const multas_control = {
    // GET para enviar las multas no pagadas de un grupo
    get_multas_por_grupo: async (req, res) => {
        const { Grupo_id } = req.body;

        if (!Grupo_id) {
            return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
        }

        try {
            // Verificar que el grupo existe
            const { } = await existe_grupo(Grupo_id)
            // verificar que el socio tiene permiso
            await tiene_permiso(req.id_socio_actual, Grupo_id);


            const query = "SELECT * FROM multas WHERE Grupo_id = ? and Status = 0 order by Socio_id, Sesion_id";
            const [multas] = await db.query(query, [Grupo_id]);

            return res.json({ code: 200, message: 'Multas obtenidas', data: multas }).status(200);
        } catch (error) {
            if (typeof (error) == "string") {
                // enviar mensaje de error
                return res.status(400).json({ code: 400, message: error });
            }

            console.log(error);
            return res.status(500).json({ code: 500, message: 'Error en el servidor' });
        }
    },

    // POST para generar una multa
    crear_multa: async (req, res) => {
        const Grupo_id = req.body.Grupo_id;
        const campos_multa = {
            Monto_multa: req.body.Monto_multa,
            Descripcion: req.body.Descripcion,
            Socio_id: req.body.Socio_id,
            Sesion_id: null
        };

        if (campos_incompletos({ ...campos_multa, Grupo_id })) {
            return res.status(400).json({ code: 400, message: "Campos incompletos" });
        }

        try {
            // Verificar que el socio existe
            await existe_socio(campos_multa.Socio_id);

            // Obtener el grupo (por medio de la sesion)
            await existe_grupo(Grupo_id);

            // verificar que el socio tiene permiso
            await tiene_permiso(req.id_socio_actual, Grupo_id);

            //FALTA VALIDAR QUE EL USUARIO PERTENEZCA A ESE GRUPO
            await socio_en_grupo(campos_multa.Socio_id, Grupo_id)

            // Obtener la sesion activa del grupo
            const sesion = await obtener_sesion_activa();
            campos_multa.Sesion_id = sesion.Sesion_id;

            const query = "INSERT INTO multas SET ?";
            await db.query(query, campos_multa);

            return res.json({ code: 200, message: 'Multa creada' }).status(200);
        } catch (error) {
            const { message, code } = catch_common_error(error)
            return res.json({ code, message }).status(code);
        }
    },

    // POST para pagar una multa
    pagar_multas: async (req, res) => {
        // arreglo con los ids de las multas y el id del grupo
        const { Multas, Grupo_id } = req.body;

        if (campos_incompletos({ Multas, Grupo_id })) {
            return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
        }

        try {
            // Obtener la sesion actual
            const sesion = await obtener_sesion_activa(Grupo_id);

            // verificar que el socio tiene permiso
            await tiene_permiso(req.id_socio_actual, sesion.Grupo_id);

            // obtener id del acuerdo actual
            const acuerdo = await obtener_acuerdo_actual(sesion.Grupo_id);

            let multas_con_error = [];
            // iterar sobre los id de las multas
            for (const Multa_id of Multas) {
                // cuando algo falla, levanta un error, y en el catch agregarlo a multas con error
                try {
                    // Verificar que la multa existe
                    const multa = await existe_multa(Multa_id);

                    // Verificar que la multa no esté pagada
                    if (multa.Status != 0) {
                        throw "La multa ya está pagada";
                    }

                    // establecer campos de la transaccion
                    const campos_transaccion = {
                        Cantidad_movimiento: multa.Monto_multa,
                        Caja: sesion.Caja + multa.Monto_multa,
                        Sesion_id: sesion.Sesion_id,
                        Socio_id: multa.Socio_id,
                        Acuerdo_id: acuerdo.Acuerdo_id,
                        Catalogo_id: 'PAGO_MULTA'
                    }

                    // crear Transaccion
                    let query = "INSERT INTO transacciones SET ?";
                    const [resultadoTransaccion] = await db.query(query, campos_transaccion);

                    // Actualizar Status y Transaccion_id de multa
                    query = "UPDATE multas SET Status = 1, Transaccion_id = ? WHERE Multa_id = ?";
                    await db.query(query, [resultadoTransaccion.insertId, Multa_id]);

                    // Actualizar caja de la sesion
                    query = "UPDATE sesiones SET Caja = ? WHERE Sesion_id = ?";
                    await db.query(query, [campos_transaccion.Caja, Sesion_id]);

                } catch (error) { // cacha las multas con error
                    multas_con_error.push({
                        Multa_id,
                        error: (typeof (error) === "string") ?
                            error :
                            "Error del servidor"
                    });
                }
            }

            if (multas_con_error.length > 0) {
                return res.json({ code: 400, message: 'Multas con error', data: multas_con_error }).status(400);
            }

            return res.json({ code: 200, message: 'Multas pagadas' }).status(200);

        } catch (error) {
            const { message, code } = catch_common_error(error)
            return res.json({ code, message }).status(code);
        }
    },
}

module.exports = multas_control;