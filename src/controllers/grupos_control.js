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

export const agregar_socio = async (req, res) => {
    const {Socio_id, Codigo_grupo} = req.body;
    console.log(Socio_id, Codigo_grupo);

    if(Socio_id && Codigo_grupo){
        // Verificar que existe el grupo y obtener el id del grupo con ese codigo
        let query = "SELECT Grupo_id FROM grupos WHERE Codigo_grupo = ?";
        const grupo_id = await db.query(query, [Codigo_grupo]);
        if(grupo_id.length == 0){
            return res.status(500).json({code: 500, message: 'Este grupo no existe'});
        }
        // Verificar que existe el socio y obtener el id del grupo con ese codigo
        let query2 = "SELECT * FROM socios WHERE Socio_id = ?";
        const socio = await db.query(query2, [Socio_id]);
        if(socio.length == 0){
            return res.status(500).json({code: 500, message: 'Este socio no existe'});
        }
        // Verificar que el socio no este ya agregado a este grupo y este activo
        let query3 = "SELECT * FROM grupo_socio WHERE Socio_id = ? AND Grupo_id = ? AND Status = 1";
        const union = await  db.query(query3, [Socio_id, Codigo_grupo]);
        if(union.length == 0){
            try{
                let query4 = "INSERT INTO grupo_socio (Grupo_id, Socio_id) VALUES (?, ?) ";
                db.query(query4, [grupo_id[0].Grupo_id, Socio_id]);
                return res.status(201).json({code: 201, message: "Socio agregado al grupo correctamente" });
            }catch{
                return res.status(500).json({code: 500, message: 'Error al agregar un socio al grupo'});
            }
        }else{
            return res.status(500).json({code: 500, message: 'Este usuario ya esta agregado al grupo'});
        }
    }
    return res.status(500).json({code: 500, message: 'Campos incompletos'});
}