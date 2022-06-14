const db = require("../../config/database");
const { actualizar_caja } = require("../funciones_js/Sesiones");

const multas_control = {
    // GET
    get_multas_por_grupo: (req, res) => {
        const { grupo_id } = req.params;

        if (!grupo_id) {
            return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
        }

        try {
            const query = "SELECT * FROM multas WHERE Grupo_id = ?";
            const multas = db.query(query, [grupo_id]);
            return res.json({ code: 200, message: 'Multas obtenidas', data: multas }).status(200);
        } catch (err) {
            console.log(err);
            return res.json({ code: 500, message: 'Error al obtener multas' }).status(500);
        }
    },

    // POST
    crear_multa: (req, res) => {
        const campos_multa = {
            Monto_multa: req.body.Monto_multa,
            Descripcion: req.body.Descripcion,
            Sesion_id: req.body.Sesion_id,
            Socio_id: req.body.Socio_id
        };

        for (const key in campos_multa) {
            if (!campos_multa[key]) {
                return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
            }
        }

        try {
            const query = "INSERT INTO multas SET ?";
            const result = db.query(query, campos_multa);
            return res.json({ code: 200, message: 'Multa creada' }).status(200);
        } catch (err) {
            console.log(err);
            return res.json({ code: 500, message: 'Error al crear multa' }).status(500);
        }
    },

    pagar_multas: (req, res) => {
        const { Multas } = req.body;

        if (!Multas) {
            return res.json({ code: 400, message: 'Campos incompletos' }).status(400);
        }

        try {
            const error = false;
            for (const multa of Multas) {
                const resultado = pagar_multa(multa.Multa_id);
                if (resultado === -1) {
                    error = true;
                }
            }

            if (error) {
                return res.json({ code: 500, message: 'Error al pagar alguna multa' }).status(500);
            }
            return res.json({ code: 200, message: 'Multas pagadas' }).status(200);
        } catch (err) {
            console.log(err);
            return res.json({ code: 500, message: 'Error al pagar multas' }).status(500);
        }
    },
}

module.exports = multas_control;

function pagar_multa (Multa_id) {
    // obtener datos de multa
    let query = "SELECT * FROM multas WHERE Multa_id = ?";
    const multas = db.query(query, [Multa_id])

    // verificar que la multa no este pagada
    if (multas[0].Status != 0) {
        return -1;
    }

    // validar que la multa exista
    if (multas.length === 0) {
        return -1;
    }

    // extraer datos de multa
    const { Socio_id, Monto_multa, Sesion_id } = multas[0];
    
    // obtener datos de la sesion
    query = "SELECT * FROM sesiones WHERE Sesion_id = ?";
    const sesion = db.query(query, [Sesion_id]);
    const { Caja_cierre } = sesion[0];

    // establecer campos de la multa
    const campos_transaccion = {
        Cantidad_movimiento: -Monto_multa,
        Caja: Caja_cierre,
        Socio_id: Socio_id,
        Sesion_id: Sesion_id,
        Cat_id: "PAGO_MULTA"
    }

    // crear Transaccion
    query = "INSERT INTO transacciones SET ?";
    const resultado = db.query(query, campos_transaccion);
    
    // Actualizar Status y Transaccion_id de multa
    query = "UPDATE multas SET Status = 1, Transaccion_id = ? WHERE Multa_id = ?";
    db.query(query, [resultado.insertId, Multa_id]);

    // Actualizar Caja_cierre de sesion
    if(!actualizar_caja(Sesion_id, -Monto_multa)){
        return -1;
    }
}