import * as bcrypt from "bcrypt";
import { secret } from "../config/config";
import db from "../config/database";
import { actualizar_password, aplanar_respuesta, campos_incompletos, catch_common_error, existe_pregunta, existe_socio, Fecha_actual, validarCurp, validar_password } from "../utils/validaciones";
import * as jwt from "jsonwebtoken";
import { OkPacket } from "mysql2";

export const register = async (req, res, next) => {
    // Recoger los datos del body
    const campos_usuario = {
        Nombres: req.body.Nombres,
        Apellidos: req.body.Apellidos,
        CURP: req.body.CURP,
        Fecha_nac: req.body.Fecha_nac,
        Nacionalidad: req.body.Nacionalidad,
        Sexo: req.body.Sexo,
        Escolaridad: req.body.Escolaridad,
        Ocupacion: req.body.Ocupacion,
        Estado_civil: req.body.Estado_civil,
        Hijos: req.body.Hijos,
        Telefono: req.body.Telefono,
        Email: req.body.Email,
        Localidad: req.body.Localidad,
        Municipio: req.body.Municipio,
        Estado: req.body.Estado,
        CP: req.body.CP,
        Pais: req.body.Pais,
        Foto_perfil: req.body.Foto_perfil,
        Fecha_reg: Fecha_actual(),
        Username: req.body.Username.toLowerCase(),
        Password: req.body.Password,
    };

    //campos incompletos
    if (campos_incompletos(campos_usuario)) {
        res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    //comprobar que el socio no exista
    let query = "SELECT * FROM socios WHERE Username = ?";
    const rows = ((await db.query(query, [campos_usuario.Username]))[0]) as Socio[];
    if (rows.length > 0) {
        return res.status(400).json({ code: 400, message: 'El usuario ya existe' });
    }

    //comprobar que el curp sea valido
    if (!validarCurp(campos_usuario.CURP)) {
        return res.status(400).json({ code: 400, message: 'El curp no es valido' });
    }
    //comprobar que el curp sea unico
    query = "SELECT * FROM socios WHERE CURP = ?";
    const curpsIguales = /**@type {Socio[]} */ ((await db.query(query, [campos_usuario.CURP])[0]));
    if (curpsIguales.length > 0) {
        return res.status(400).json({ code: 400, message: 'El curp ya existe' });
    }

    //comprobar que los campos esten completos
    var BCRYPT_SALT_ROUNDS = 12   //variable para indicar los saltos a bcrypt
    bcrypt.hash(campos_usuario.Password, BCRYPT_SALT_ROUNDS)
        .then(async function (hashedPassword) {
            campos_usuario.Password = hashedPassword;

            let query = "INSERT INTO socios SET ?";
            const result = ((await db.query(query, campos_usuario))[0]) as OkPacket;

            // res.json({code: 200, message: 'Usuario guardado'}).status(200);
            console.log(result);

            //Preparando el Next:
            const { Pregunta_id, Respuesta } = req.body;
            req.body = {
                Socio_id: result.insertId,
                Password: campos_usuario.Password,
                Pregunta_id: Pregunta_id,
                Respuesta: Respuesta,
            };

            next();
        }

        )
        .catch(function (error) {
            res.status(500).json({ code: 500, message: 'Algo salio mal' });
        })


    ///codigos de respuesta . . .
    //200: usuario autenticado
    //400: error del usuario
    //500: error del servidor
}

//Funcion para agregar o modificar pregunta de seguridad del socio
export const preguntas_seguridad_socio = async (req, res) => {
    const { Pregunta_id, Password } = req.body;
    const Respuesta = req.body.Respuesta ? aplanar_respuesta(req.body.Respuesta) : undefined;
    const { id_socio_actual } = req;
    const Socio_id = id_socio_actual || req.body.Socio_id;

    try {
        // Validaciones
        await existe_socio(Socio_id);
        await existe_pregunta(Pregunta_id);

        if (campos_incompletos({ Socio_id, Pregunta_id, Respuesta })) {
            return res.status(400).json({ code: 400, message: 'Campos incompletos' });
        }

        // Obtener la respuesta del socio
        let query = "Select * from preguntas_socios where socio_id = ?"
        const preguntas_socios = ((await db.query(query, [Socio_id, Pregunta_id]))[0]) as PreguntaSocio[];

        if (await validar_password(Socio_id, Password)) {
            if (id_socio_actual && preguntas_socios.length !== 0) {
                query = "UPDATE preguntas_socios SET ? where socio_id = ?";
                await db.query(query, [{ Socio_id: id_socio_actual, Pregunta_id, Respuesta: bcrypt.hashSync(/**@type {String} */(Respuesta), 10) }, Socio_id]);
                return res.json({ code: 200, message: 'Pregunta del socio Actualizada' }).status(200);
            } else {
                if (preguntas_socios.length === 0) {
                    query = "INSERT INTO preguntas_socios (Socio_id, Pregunta_id, Respuesta) VALUES (?, ?, ?)";
                    await db.query(query, [Socio_id, Pregunta_id, bcrypt.hashSync(/**@type {String} */(Respuesta), 10)]);
                    return res.json({ code: 200, message: 'Pregunta del socio agregada' }).status(200);
                }
                else {
                    return res.json({ code: 500, message: 'Error interno del servidor' }).status(500);
                }
            }
        }
        else {
            return res.json({ code: 400, message: 'El password es incorrecto' }).status(400);
        }

    } catch (error) {
        const { message, code } = catch_common_error(error);
        return res.json({ code, message }).status(code);
    }
}

//Funcion para enviar las preguntas de seguridad
// export const enviar_preguntas_seguridad = async (req, res) => {

// }

//funcion para login
export const login = async (req, res) => {
    const { Username, Password } = req.body;
    if (Username && Password) {
        let query = "SELECT * FROM socios WHERE Username = ?";
        let [result] = await db.query(query, [Username.toLowerCase()]) as [Socio[], any];

        //validar que existe el usuario
        if (result.length > 0) {
            //validar que la contraseña sea correcta
            if (bcrypt.compareSync(Password, result[0].Password)) {
                //generar token
                const token = jwt.sign({
                    Username: result[0].Username,
                    Socio_id: result[0].Socio_id
                }, secret);

                //mandando token por el header
                return res.status(200).json({ code: 200, message: 'Usuario autenticado', token, data: { Socio_id: result[0].Socio_id, Username: result[0].Username } });
            }
            else {
                return res.status(401).json({ code: 400, message: 'Contraseña incorrecta' });
            }
        }
        else {
            //usuario no existe
            return res.status(400).json({ code: 400, message: 'Usuario no existe' });
        }
    } else {
        //campos incompletos
        return res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }
}


//funcion para Recuperar Contraseña
export const recuperar_password = (req, res) => {
    const { Socio_id, Pregunta_id, Respuesta, Password } = req.body;

    if (campos_incompletos({ Socio_id, Pregunta_id, Respuesta, Password })) {
        return res.status(400).json({ code: 400, message: "campos incompletos" });
    }

    // Validaciones
    Promise.all([existe_socio(Socio_id), existe_pregunta(Pregunta_id)])
        .then(async () => { // Si la informacion es valida
            // Obtener la respuesta del socio
            let query = "Select * from preguntas_socios where socio_id = ? and Pregunta_id = ?"
            const preguntas_socios = ((await db.query(query, [Socio_id, Pregunta_id]))[0]) as PreguntaSocio[];

            if (preguntas_socios.length === 0) {
                return res.status(400).json({ code: 400, message: "Pregunta Incorrecta" });
            }

            // Verificar que la respuesta sea correcta
            if (!bcrypt.compareSync(aplanar_respuesta(Respuesta), preguntas_socios[0].Respuesta)) {
                return res.status(400).json({ code: 400, message: "Respuesta Incorrecta" });
            }

            //actualizar la contraseña
            actualizar_password(Socio_id, Password)
            return res.status(200).json({ code: 200, message: "Contraseña actualizada correctamente" });
        })
        .catch(error => {
            const { message, code } = catch_common_error(error);
            return res.status(code).json({ code, message });
        });
    /* 
    
    Prommise.all([promesa1, promesa2, promesa3])
        .then(([res1, res2, res3]) => {
            console.log(res1);
        })
        .catch((error) => {
            console.log(error);
        })

    SumaAsync(n1,n2)
        .then((result) => {console.log(result);})

    */
}