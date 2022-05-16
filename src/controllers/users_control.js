const jwt = require('jsonwebtoken');
const db = require('../../config/database');
var bcrypt = require('bcrypt');

export const getPrueba = async (req, res) => {
    let query = "SELECT * FROM socios";
    const rows = await db.query(query);
    console.log(rows);
    res.send('Hello World')
}

export const register = async (req, res) => {
    // const {Password} = req.body;
    const {Nombres, Apellidos, CURP, Fecha_nac, Nacionalidad, Sexo, Escolaridad, Ocupacion, Estado_civil, Hijos, Telefono, Email, Localidad, Municipio, Estado, CP, Pais, Foto_perfil, Username, Password, Fecha_reg, Pregunta_sec, Respuesta_sec} = req.body;
    

    if(Nombres && Apellidos && CURP && Fecha_nac && Nacionalidad && Sexo && Escolaridad && Ocupacion && Estado_civil && Hijos && Telefono && Email && Localidad && Municipio && Estado && CP && Pais && Foto_perfil && Username && Password && Fecha_reg && Pregunta_sec && Respuesta_sec){
        var BCRYPT_SALT_ROUNDS =12   //variable para indicar los saltos a bcrypt
        bcrypt.hash(Password, BCRYPT_SALT_ROUNDS)
        .then(function(hashedPassword){
            var password = hashedPassword;
            console.log(password);
            let query = "INSERT INTO socios (Nombres, Apellidos, CURP, Fecha_nac, Nacionalidad, Sexo, Escolaridad, Ocupacion, Estado_civil, Hijos, Telefono, Email, Localidad, Municipio, Estado, CP, Pais, Foto_perfil, Username, Password, Fecha_reg, Pregunta_sec, Respuesta_sec)";
            query += `VALUES ('${Nombres}', '${Apellidos}', '${CURP}', '${Fecha_nac}', '${Nacionalidad}', '${Sexo}', '${Escolaridad}', '${Ocupacion}', '${Estado_civil}', '${Hijos}', '${Telefono}', '${Email}', '${Localidad}', '${Municipio}', '${Estado}', '${CP}', '${Pais}', '${Foto_perfil}', '${Username}', '${password}', '${Fecha_nac}', '${Pregunta_sec}', '${Respuesta_sec}')`;
            db.query(query);

            // if(rows.affectedRows == 1){
            //     return res.status(201).json({code: 201, message: "usuario registrado correctamente" });
            // }
            // return res.status(500).json({code: 500, message: "Ocurrio un error" });
            res.json({code: 200, message: 'Usuario guardado'});
        })
        .catch(function(error){
            console.log("Error saving user: ");
            console.log(error);
            res.json({code: 500, message:'Algo salio mal'});
        })
        
    }else{
        res.json({saludo: 'Hello es una prueba'});
    }
    // return res.status(500).json({code: 500, message: "Campos incompletos" });
    
}

export const login = (req, res) => {
    res.send('Hello World')
}