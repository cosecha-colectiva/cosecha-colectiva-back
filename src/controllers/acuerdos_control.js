import { Fecha_actual, campos_incompletos } from '../funciones_js/validaciones';

const db = require('../../config/database');

// funcion para crear acuerdos
export const crear_acuerdos = async (req, res) => { //
    const body = req.body;
    const campos_acuerdo = {
        Grupo_id: body.Grupo_id,
        Fecha_acuerdos: Fecha_actual(),
        Fecha_acuerdos_fin: body.Fecha_acuerdos_fin,
        Periodo_reuniones: body.Periodo_reuniones,
        Periodo_cargos: body.Periodo_cargos,
        Limite_inasistencias: body.Limite_inasistencias,
        Minimo_aportacion: body.Minimo_aportacion,
        Costo_acciones: body.Costo_acciones,
        Tasa_interes: body.Tasa_interes,
        Limite_credito: body.Limite_credito,
        Porcentaje_fondo_comun: body.Porcentaje_fondo_comun,
        Creditos_simultaneos: body.Creditos_simultaneos,
        Interes_morosidad: body.Interes_morosidad,
        Ampliacion_prestamos: body.Ampliacion_prestamos, // true o false
        Interes_ampliacion: body.Ampliacion_prestamos == "1" ? body.Interes_ampliacion : null, // si ampliacion prestamos... agrega interes ampliacion
        Mod_calculo_interes: body.Mod_calculo_interes,
        Tasa_interes_prestamo_grande: body.Tasa_interes_prestamo_grande,
        Id_socio_administrador: body.Id_socio_administrador,
        Id_socio_administrador_suplente: body.Id_socio_administrador_suplente,
    };

    if(campos_incompletos(campos_acuerdo)){
        return res.status(400).json({code: 400, message: "Campos incompletos"});
    }
    
    try{
        //Actualizar status del acuerdo anterior
        let query = "UPDATE acuerdos SET Status = 0 WHERE Grupo_id = ? and Status = 1";
        db.query(query, [campos_acuerdo.Grupo_id]);
        
        query = "INSERT INTO acuerdos SET ?";
        const rows = db.query(query, [campos_acuerdo]);
        return res.status(200).json({code: 200, message: "Acuerdo registrado correctamente" });
    } catch(error){
        if(error.errno == 1452){
            return res.status(400).json({code: 400, message: 'Error con llaves foraneas'});
        }else{
            console.log(error);
            return res.status(500).json({code: 500, message: 'Error en el servidor'});
        }
    }
}
                                      
//funcion para crear acuerdo secundario
/* Estructura de tabla 'acuerdos_secundarios':
Acuerdo_id, Grupo_id, Regla, Acuerdo, Fecha_acuerdo, Fecha_acuerdo_fin, Activo */
export const crear_acuerdo_secundario = async (req, res) => {
    const {Grupo_id, Regla, Acuerdo, Fecha_acuerdo, Fecha_acuerdo_fin, Activo} = req.body;

    // Verificar que los campos esten completos
    if(Grupo_id && Regla && Acuerdo && Fecha_acuerdo && Fecha_acuerdo_fin && Activo){
        //insertar en la base de datos
        const query = "INSERT INTO acuerdos_secundarios (Grupo_id, Regla, Acuerdo, Fecha_acuerdo, Fecha_acuerdo_fin, Activo) VALUES (?, ?, ?, ?, ?, ?)";

        try{
            const rows = db.query(query, [Grupo_id, Regla, Acuerdo, Fecha_acuerdo, Fecha_acuerdo_fin, Activo]);
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
}
