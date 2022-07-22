/* // crear nueva transaccion
export const crearTransaccion = (transaccion) => {
    //verificar el tipo de transaccion
    if (transaccion.Catalogo_id) {
        
    }
        //consultar al grupo la caja y hacer la suma o la resta
    // establecer campos de la transaccion
    const campos_transaccion = {
        Cantidad_movimiento: transaccion.Cantidad_movimiento,
        Caja: transaccion.Caja, //este dato no se recibe, lo generamos
        Socio_id: transaccion.Socio_id,
        Sesion_id: transaccion.Sesion_id,
        Catalogo_id: transaccion.Catalogo_id,
        Acuerdo_id: transaccion.Acuerdo_id,
    }

    // crear Transaccion
    query = "INSERT INTO transacciones SET ?"; //Probablemente de error si no mandamos los values
    const resultado = db.query(query, campos_transaccion);
        //Falta actualizatr la caja de la tabla grupos

    // Actualizar Caja_cierre de sesion
    const resultadoActualizarCaja = actualizar_caja(Sesion_id, campos_transaccion);

    // retornar resultado
    return resultado;
} */