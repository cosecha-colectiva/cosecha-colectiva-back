const db = require('../../config/database');
const random = require('string-random');
import {Fecha_actual} from '../funciones_js/validaciones';

// Funcion para creacion de grupos
export const crear_grupos = async (req, res) => {
    // Recoger los datos del body
    const {Nombre_grupo, Localidad, Municipio, Estado, CP, Pais} = req.body;
    // Verificar que los campos esten completos
    if(Nombre_grupo && Localidad && Municipio && Estado && CP && Pais){
        var bandera = true;
        while(bandera){
            const rand = random(6, {letters: false});
            //comprobar que el codigo de grupo no exista
            let query = "SELECT * FROM grupos WHERE Codigo_grupo = ?";
            var rows = await db.query(query, [rand]);
            if(rows.length == 0){
                bandera = false;
                const Fecha_reg = Fecha_actual();
                let query = "INSERT INTO grupos (Nombre_grupo, Codigo_grupo, Localidad, Municipio, Estado, CP, Pais, Fecha_reg)";
                query += `VALUES ('${Nombre_grupo}', '${rand}', '${Localidad}', '${Municipio}', '${Estado}', '${CP}', '${Pais}', '${Fecha_reg}');`;
                db.query(query);
                return res.status(201).json({code: 201, message: "Grupo registrado correctamente" });
            }
            else{
                bandera = true;
            }
            // bandera = false;
        }
    }else{
        //campos incompletos
        res.status(400).json({code: 400, message: 'Campos incompletos'});
    }

}