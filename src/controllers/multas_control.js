const db = require("../../config/database");
const { actualizar_caja } = require("../funciones_js/Sesiones");

const multas_control = {
    // GET
    get_multas_por_grupo: (req, res) => {
        const { grupo_id } = req.params;

        if (!grupo_id) {
            return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
        }

        const query = "SELECT * FROM multas WHERE Grupo_id = ?";

        db.query(query, [grupo_id])
            .then(rows => {
                res.json({ code: 200, message: 'Multas obtenidas', data: rows }).status(200);
            })
            .catch(err => {
                res.json({ code: 500, message: 'Error al obtener multas' }).status(500);
            });
    },

    // POST
    crear_multa: (req, res) => {
        const campos_multas = [
            "Monto_multa",
            "Descripcion",
            "Sesion_id",
            "Socio_id"
        ];

        const valores_campos = [];

        campos_multas.forEach(campo => {
            if (req.body[campo]) {
                valores_campos.push(req.body[campo]);
            }
        });

        if (valores_campos.length !== campos_multas.length) {
            return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
        }

        const query = "INSERT INTO multas (" + campos_multas.join(", ") + ") VALUES (" + campos_multas.map(() => "?").join(", ") + ")";

        db.query(query, valores_campos)
            .then(result => {
                return res.status(200).json({ code: 200, message: 'Multa creada' });
            })
            .catch(err => {
                return res.status(500).json({ code: 500, message: 'Error al crear multa' });
            });
    },

    pagar_multa: (req, res) => {
        const { Multa_id } = req.body;

        if (!Multa_id) {
            return res.status(400).json({ code: 400, message: 'Campos incompletos' });
        }

        // obtener datos de multa
        let query = "SELECT * FROM multas WHERE Multa_id = ?";
        db.query(query, [Multa_id])
            .then(result => {
                // validar que la multa exista
                if (result.length === 0) {
                    return res.status(404).json({ code: 404, message: 'Multa no encontrada' });
                }

                // extraer datos de multa
                const { Socio_id, Monto_multa, Sesion_id } = result[0];

                // obtener datos de la sesion
                query = "SELECT * FROM sesiones WHERE Sesion_id = ?";
                const sesiones = await db.query(query, [Sesion_id]);
                const { Caja_cierre } = sesiones[0];

                // establecer campos de la multa
                const campos_multas = {
                    Cantidad_movimiento: -Monto_multa,
                    Caja: Caja_cierre,
                    Socio_id,
                    Sesion_id,
                    Cat_id: "PAGO_MULTA"
                }

                // crear Transaccion
                query = "INSERT INTO transacciones SET ?";
                const transaccion = await db.query(query, campos_multas);

                // Actualizar Status y Transaccion_id de multa
                query = "UPDATE multas SET Status = 1, Transaccion_id = ? WHERE Multa_id = ?";
                await db.query(query, [transaccion.insertId, Multa_id]);

                // Actualizar Caja_cierre de sesion
                actualizar_caja(Sesion_id, Monto_multa);

                return res.status(200).json({ code: 200, message: 'Multa pagada' });
            })
            .catch(err => {
                return res.status(500).json({ code: 500, message: 'Error al pagar multa' });
            });
    },
}

module.exports = multas_control;