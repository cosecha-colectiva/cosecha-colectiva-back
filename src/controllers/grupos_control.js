const db = require('../../config/database');
import {campos_incompletos, Fecha_actual, generarCodigoValido} from '../funciones_js/validaciones';

// Funcion para creacion de grupos
export const crear_grupo = async (req, res) => {
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

    if(campos_incompletos(campos_grupo)){
        res.status(400).json({code: 400, message: 'Campos incompletos'});
    }

    try {
        let query = "INSERT INTO grupos SET ?";
        const rows = db.query(query, [campos_grupo]);
        return res.status(201).json({code: 201, message: "Grupo registrado correctamente" });
    } catch (error) {
        return res.status(500).json({code: 500, message: 'Error en el servidor'});
    }
}

export const agregar_socio = (req, res) => {
    const {Socio_id, Codigo_grupo} = req.body;

    // Obtener el id del grupo con ese codigo
    let query = "Select Grupo_id from grupos where Codigo_grupo = ?";
    
    db.query(query, [Codigo_grupo])
        .then(({Grupo_id}) => {
            query = "Insert into grupo_socio ()"
        })
}