const db = require('../../config/database');

// funcion para crear acuerdos
/* Estructura de tabla 'acuerdos':
Grupo_id, Fecha_acuerdos, Fecha_acuerdos_fin_tentativo, Fecha_acuerdos_fin, Activos, Periodo_reuniones, Periodo_cargos, Limite_inasistencias, Minimo_aportacion, Costo_acciones, Tasa_interes, Limite_credito, Porcentaje_fondo_comun, Creditos_simultaneos, Interes_morosidad, Ampliacion_prestamos, Interes_ampliacion, Id_socio_administrador, Id_socio_administrador_suplente */
export const crear_acuerdos = async (req, res) => {
    const {Grupo_id, Fecha_acuerdos, Fecha_acuerdos_fin_tentativo, Fecha_acuerdos_fin, Activos, Periodo_reuniones, Periodo_cargos, Limite_inasistencias, Minimo_aportacion, Costo_acciones, Tasa_interes, Limite_credito, Porcentaje_fondo_comun, Creditos_simultaneos, Interes_morosidad, Ampliacion_prestamos, Interes_ampliacion, Id_socio_administrador, Id_socio_administrador_suplente} = req.body;

    // Verificar que los campos esten completos
    if(Grupo_id && Fecha_acuerdos && Fecha_acuerdos_fin_tentativo && Fecha_acuerdos_fin && Activos && Periodo_reuniones && Periodo_cargos && Limite_inasistencias && Minimo_aportacion && Costo_acciones && Tasa_interes && Limite_credito && Porcentaje_fondo_comun && Creditos_simultaneos && Interes_morosidad && Ampliacion_prestamos && Interes_ampliacion && Id_socio_administrador && Id_socio_administrador_suplente){
        //insertar en la base de datos
        const query = "INSERT INTO acuerdos (Grupo_id, Fecha_acuerdos, Fecha_acuerdos_fin_tentativo, Fecha_acuerdos_fin, Activos, Periodo_reuniones, Periodo_cargos, Limite_inasistencias, Minimo_aportacion, Costo_acciones, Tasa_interes, Limite_credito, Porcentaje_fondo_comun, Creditos_simultaneos, Interes_morosidad, Ampliacion_prestamos, Interes_ampliacion, Id_socio_administrador, Id_socio_administrador_suplente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try{
            const rows = await db.query(query, [Grupo_id, Fecha_acuerdos, Fecha_acuerdos_fin_tentativo, Fecha_acuerdos_fin, Activos, Periodo_reuniones, Periodo_cargos, Limite_inasistencias, Minimo_aportacion, Costo_acciones, Tasa_interes, Limite_credito, Porcentaje_fondo_comun, Creditos_simultaneos, Interes_morosidad, Ampliacion_prestamos, Interes_ampliacion, Id_socio_administrador, Id_socio_administrador_suplente]);
            return res.status(201).json({code: 201, message: "Acuerdo registrado correctamente" });
        }catch(error){
            if(error.errno == 1452){
                return res.status(400).json({code: 400, message: 'Error con llaves foraneas'});
            }else{
                return res.status(500).json({code: 500, message: 'Error en el servidor'});
            }
        }
    }else{
        //campos incompletos
        res.status(400).json({code: 400, message: 'Campos incompletos'});
    }

    /* codigos de respuesta:
    201: creado
    400: campos incompletos
    500: error en el servidor */

    /* json de ejemplo para peticion:
    {
        "Grupo_id": "164",
        "Fecha_acuerdos": "2020-01-01",
        "Fecha_acuerdos_fin_tentativo": "2020-01-01",
        "Fecha_acuerdos_fin": "2020-01-01",
        "Activos": "1",
        "Periodo_reuniones": "1",
        "Periodo_cargos": "1",
        "Limite_inasistencias": "1",
        "Minimo_aportacion": "1",
        "Costo_acciones": "1",
        "Tasa_interes": "1",
        "Limite_credito": "1",
        "Porcentaje_fondo_comun": "1",
        "Creditos_simultaneos": "1",
        "Interes_morosidad": "1",
        "Ampliacion_prestamos": "1",
        "Interes_ampliacion": "1",
        "Id_socio_administrador": "54",
        "Id_socio_administrador_suplente": "64"
    } */
}

//funcion para crear acuerdo secundario
/* Estructura de tabla 'acuerdos_secundarios':
Acuerdo_id, Grupo_id, Regla, Acuerdo, Fecha_acuerdo, Fecha_acuerdo_fin, Activo */
export const crear_acuerdo_secundario = async (req, res) => {
    const {Grupo_id, Regla, Acuerdo, Fecha_acuerdo, Fecha_acuerdo_fin, Activo} = req.body;

    // Verificar que los campos esten completos
    if(Grupo_id && Regla && Acuerdo && Fecha_acuerdo && Fecha_acuerdo_fin && Activo){
        //insertar en la base de datos
        const query = "INSERT INTO Acuerdos_secundarios (Grupo_id, Regla, Acuerdo, Fecha_acuerdo, Fecha_acuerdo_fin, Activo) VALUES (?, ?, ?, ?, ?, ?)";

        try{
            const rows = await db.query(query, [Grupo_id, Regla, Acuerdo, Fecha_acuerdo, Fecha_acuerdo_fin, Activo]);
            return res.status(201).json({code: 201, message: "Acuerdo secundario registrado correctamente" });
        }catch(error){
            if(error.errno == 1452){
                return res.status(400).json({code: 400, message: 'Error con llaves foraneas'});
            }else{
                return res.status(500).json({code: 500, message: 'Error en el servidor'});
            }
        }
    }else{
        //campos incompletos
        res.status(400).json({code: 400, message: 'Campos incompletos'});
    }

    /* codigos de respuesta:
    201: creado
    400: campos incompletos
    500: error en el servidor */

    /* json de ejemplo para peticion:
    {
        "Acuerdo_id": "1",
        "Grupo_id": "164",
        "Regla": "1",
        "Acuerdo": "1",
        "Fecha_acuerdo": "2020-01-01",
        "Fecha_acuerdo_fin": "2020-01-01",
        "Activo": "1"
    } */
}
