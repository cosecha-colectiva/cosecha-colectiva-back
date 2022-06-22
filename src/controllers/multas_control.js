const db = require("../../config/database");
const { actualizar_caja } = require("../funciones_js/Sesiones");

const multas_control = {
    // GET para enviar las multas no pagadas de un grupo
    get_multas_por_grupo: (req, res) => {
        const { grupo_id } = req.body;

        if (!grupo_id) {
            return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
        }

        try {
            const query = "SELECT * FROM multas WHERE Grupo_id = ? and Status = 0 order by Socio_id, Fecha_multa";
            const multas = db.query(query, [grupo_id]);
            return res.json({ code: 200, message: 'Multas obtenidas', data: multas }).status(200);
        } catch (err) {
            console.log(err);
            return res.json({ code: 500, message: 'Error al obtener multas' }).status(500);
        }
    },

    // POST para generar una multa
    crear_multa: async (req, res) => {
        const campos_multa = {
            Monto_multa: req.body.Monto_multa,
            Descripcion: req.body.Descripcion,
            Sesion_id: req.body.Sesion_id,
            Socio_id: req.body.Socio_id
        };

        for (const key in campos_multa) {
            if (!campos_multa[key]) {
                console.log(key)
                return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
            }
        }

        try {
            const query = "INSERT INTO multas SET ?";
            const result = await db.query(query, campos_multa);
            return res.json({ code: 200, message: 'Multa creada' }).status(200);
        } catch (err) {
            console.log(err);
            return res.json({ code: 500, message: 'Error al crear multa' }).status(500);
        }
    },

    // POST para pagar una multa
    pagar_multas: (req, res) => {
        const { Multas, Sesion_id } = req.body;

        if (!Multas) {
            return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
        }

        try {
            let multas_con_error = [];

            // iterar sobre los id de las multas
            for (const Multa_id of Multas) {
                // obtener datos de multa
                let query = "SELECT * FROM multas WHERE Multa_id = ?";
                const multas = db.query(query, [Multa_id])
            
            //Podriamos hacerlo con un operador ternario -------------------------------------
                // validar que la multa exista
                if (multas.length === 0) {
                    multas_con_error.push(Multa_id);
                    continue;
                }

                // verificar que la multa no este pagada
                if (multas[0].Status != 0) {
                    multas_con_error.push(Multa_id);
                    continue;
                }
            //---------------------------------------------------------------------------------
                // extraer datos de multa
                const { Socio_id, Monto_multa } = multas[0]; //??
                
                // obtener datos de la sesion Actual
                query = "SELECT * FROM sesiones WHERE Sesion_id = ?";
                const sesion = db.query(query, [Sesion_id]);
                const { Caja, Grupo_id } = sesion[0];//??

                // obtener id del acuerdo actual
                query = "SELECT * FROM acuerdos WHERE Grupo_id = ? and Status = 1";
                const acuerdos = db.query(query, [Grupo_id]);
                const { Acuerdo_id } = acuerdos[0];
                
                // establecer campos de la multa
                const campos_transaccion = {
                    Cantidad_movimiento: +Monto_multa,
                    Caja: Caja + Monto_multa,
                    Sesion_id: Sesion_id,
                    Socio_id: Socio_id,
                    Acuerdo_id: Acuerdo_id,
                    Catalogo_id: 'PAGO_MULTA' // 24 = PAGO_MULTA
                }
            
                // crear Transaccion
                query = "INSERT INTO transacciones SET ?";
                const resultadoTransaccion = db.query(query, campos_transaccion);
                
                // Actualizar Status y Transaccion_id de multa
                query = "UPDATE multas SET Status = 1, Transaccion_id = ? WHERE Multa_id = ?";
                db.query(query, [resultadoTransaccion.insertId, Multa_id]);
            
                // Actualizar caja de la sesion
                query = "UPDATE sesiones SET Caja = ? WHERE Sesion_id = ?";
                db.query(query, [campos_transaccion.Caja, Sesion_id]);
            }

            if(multas_con_error.length > 0) {
                return res.json({ code: 400, message: 'Multas con error', data: multas_con_error }).status(400);
            }

            return res.json({ code: 200, message: 'Multas pagadas' }).status(200);
        } catch (err) {
            console.log(err);
            return res.json({ code: 500, message: 'Error al pagar multas' }).status(500);
        }
    },
}

module.exports = multas_control;