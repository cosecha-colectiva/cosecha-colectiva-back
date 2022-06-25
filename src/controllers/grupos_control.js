const db = require('../../config/database');
import { campos_incompletos, Fecha_actual, generarCodigoValido } from '../funciones_js/validaciones';

// Funcion para creacion de grupos
export const crear_grupo = async (req, res, next) => {
    const id_socio_actual = req.id_socio_actual;
    // Recoger los datos del body
    const campos_grupo = {
        Nombre_grupo: req.body.Nombre_grupo,
        Localidad: req.body.Localidad,
        Municipio: req.body.Municipio,
        Estado: req.body.Estado,
        CP: req.body.CP,
        Pais: req.body.Pais,
        Codigo_grupo: await generarCodigoValido(),
        Fecha_reg: Fecha_actual()
    };

    if (campos_incompletos(campos_grupo)) {
        res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    try {
        let query = "INSERT INTO grupos SET ?";
        const rows = await db.query(query, [campos_grupo]);
        // return res.status(201).json({code: 201, message: "Grupo registrado correctamente" });

        req.body.Socio_id = id_socio_actual;
        req.body.Codigo_grupo = campos_grupo.Codigo_grupo;
        next();
    } catch (error) {
        return res.status(500).json({ code: 500, message: 'Error en el servidor' });
    }
}

export const agregar_socio = async (req, res) => {
    const { Socio_id, Codigo_grupo } = req.body;

    if (Socio_id && Codigo_grupo) {
        // Verificar que existe el grupo y obtener el id del grupo con ese codigo
        let query = "SELECT Grupo_id FROM grupos WHERE Codigo_grupo = ?";
        const grupo_id = await db.query(query, [Codigo_grupo]);
        if (grupo_id.length == 0) {
            return res.status(500).json({ code: 500, message: 'Este grupo no existe' });
        }
        // Verificar que existe el socio y obtener el id del grupo con ese codigo
        let query2 = "SELECT * FROM socios WHERE Socio_id = ?";
        const socio = await db.query(query2, [Socio_id]);
        if (socio.length == 0) {
            return res.status(500).json({ code: 500, message: 'Este socio no existe' });
        }

        // obtener socios activos del grupo
        query = "SELECT * FROM grupo_socio WHERE Grupo_id = ? AND Status = 1";
        const socios_activos = await db.query(query, [grupo_id[0].Grupo_id]);

        // comprobar si el socio ya está en el grupo
        if (socios_activos.find((socio) => socio.Socio_id == Socio_id)) {
            return res.status(500).json({ code: 500, message: 'Este usuario ya esta agregado al grupo' });
        }

        //ejecutar la consulta
        try {
            //comprobar si el grupo está vacio, para hacer CREADOR al que se une
            const gpo_vacio = !socios_activos.length;
            query = `INSERT INTO grupo_socio (Grupo_id, Socio_id ${gpo_vacio ? ", Tipo_socio" : ""}) VALUES (?, ? ${gpo_vacio ? ", 'CREADOR'" : ""})`;
            await db.query(query, [grupo_id[0].Grupo_id, Socio_id]);
            return res.status(200).json({ code: 200, message: "Socio agregado al grupo correctamente", data: {Codigo_grupo}});
        } catch (error) {
            return res.status(500).json({ code: 500, message: "Error al agregar Socio al grupo" });
        }
    }
    return res.status(500).json({ code: 500, message: 'Campos incompletos' });
}