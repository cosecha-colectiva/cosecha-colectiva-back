import db from '../config/database';
import { campos_incompletos, catch_common_error, existe_grupo, existe_socio, Fecha_actual, generarCodigoValido, socio_en_grupo } from '../utils/validaciones';

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
        return res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    if (campos_grupo.Codigo_grupo === "-") {
        return res.status(500).json({ code: 500, message: 'Error interno del Servidor' });
    }

    try {
        let query = "INSERT INTO grupos SET ?";
        await db.query(query, [campos_grupo]);

        req.body.Socio_id = id_socio_actual;
        req.body.Codigo_grupo = campos_grupo.Codigo_grupo;

        next();
    } catch (error) {
        return res.status(500).json({ code: 500, message: 'Error en el servidor' });
    }
}

export const agregar_socio = async (req, res) => {
    // agregar_socio, agrega al socio que ejecuta la peticion (el socio actual)
    // si se dá un Socio_id por el req.body, se agregará ese socio al grupo
    const Socio_id = req.id_socio_actual || req.body.Socio_id;
    const { Codigo_grupo } = req.body;

    if (campos_incompletos({ Socio_id, Codigo_grupo })) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    // LO DE ABAJO ES SIN PROCEDIMIENTOS ALMACENADOS
    try {
        // Verificar que existe el grupo y obtener el id del grupo con ese codigo
        const grupo = await existe_grupo(Codigo_grupo);

        // Verificar si el socio existe en la bd
        await existe_socio(Socio_id);

        try {
            // verificar que el socio esté en el grupo
            const socio = await socio_en_grupo(Socio_id, grupo.Grupo_id); // (Avienta Excepcion)

            // Si el socio está en el grupo y está inactivo...
            if (socio.Status != 1) try {
                // Si está y está inactivo... activarlo
                let query = "UPDATE grupo_socio SET Status = 1 where Socio_id = ? AND Grupo_id = ?";
                await db.query(query, [Socio_id, grupo.Grupo_id]);
            } catch (error) {
                return res.status(500).json({ code: 500, message: 'Error en el servidor' });
            }

            // Si ya está activo... mandar error
            return res.status(400).json({ code: 400, message: "El socio ya está en este grupo" });
        } catch (error) { // si el socio no está en el grupo
            const campos_grupo_socio = {
                Tipo_socio: req.body.Creando_grupo != undefined ? "CREADOR" : "SOCIO",
                Grupo_id: grupo.Grupo_id,
                Socio_id
            };

            let query = "INSERT INTO grupo_socio SET ?";
            await db.query(query, [campos_grupo_socio]);
        }
    } catch (error) {
        const { code, message } = catch_common_error(error);
        return res.status(code).json({ code, message })
    }
    return res.status(201).json({ code: 201, message: 'Usuario Agregado al grupo' });
}