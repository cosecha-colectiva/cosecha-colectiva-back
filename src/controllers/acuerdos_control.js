import { Fecha_actual } from '../funciones_js/validaciones';

const db = require('../../config/database');

// funcion para crear acuerdos
export const crear_acuerdos = async (req, res) => {
    const Fecha_acuerdos = Fecha_actual();
    const {Grupo_id, Fecha_acuerdos_fin, Status, Periodo_reuniones, Periodo_cargos, Limite_inasistencias, Minimo_aportacion, Costo_acciones, Tasa_interes, Limite_credito, Porcentaje_fondo_comun, Creditos_simultaneos, Interes_morosidad, Ampliacion_prestamos, Mod_calculo_interes, Tasa_interes_prestamo_grande, Id_socio_administrador, Id_socio_administrador_suplente} = req.body;
    
    //si ampliacion_prestamos es igual a 0, entonces no hay intereses de ampliacion
    let Interes_ampliacion = 0;
    if(Ampliacion_prestamos != "0"){
        Interes_ampliacion = req.body.Interes_ampliacion;
    }
    
    // Verificar que los campos esten completos
    if(Grupo_id && Fecha_acuerdos_fin && Status && Periodo_reuniones && Periodo_cargos && Limite_inasistencias && Minimo_aportacion && Costo_acciones && Tasa_interes && Limite_credito && Porcentaje_fondo_comun && Creditos_simultaneos && Interes_morosidad && Ampliacion_prestamos && Mod_calculo_interes && Tasa_interes_prestamo_grande && Id_socio_administrador && Id_socio_administrador_suplente){
        //insertar en la base de datos
        const query = "INSERT INTO acuerdos (Grupo_id, Fecha_acuerdos, Fecha_acuerdos_fin, Status, Periodo_reuniones, Periodo_cargos, Limite_inasistencias, Minimo_aportacion, Costo_acciones, Tasa_interes, Limite_credito, Porcentaje_fondo_comun, Creditos_simultaneos, Interes_morosidad, Ampliacion_prestamos, Interes_ampliacion, Mod_calculo_interes, Tasa_interes_prestamo_grande, Id_socio_administrador, Id_socio_administrador_suplente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try{
            const rows = db.query(query, [Grupo_id, Fecha_acuerdos, Fecha_acuerdos_fin, Status, Periodo_reuniones, Periodo_cargos, Limite_inasistencias, Minimo_aportacion, Costo_acciones, Tasa_interes, Limite_credito, Porcentaje_fondo_comun, Creditos_simultaneos, Interes_morosidad, Ampliacion_prestamos, Interes_ampliacion, Mod_calculo_interes, Tasa_interes_prestamo_grande, Id_socio_administrador, Id_socio_administrador_suplente]);
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
