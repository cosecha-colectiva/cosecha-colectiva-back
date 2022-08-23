import db from "../config/database";
import { obtenerSociosGrupo } from "./Grupos.services";
import { existeSesion, obtenerSesionActual, obtener_sesion } from "./Sesiones.services";

/**
 * Obtener las ganancias acumuladas de una sesion
 * @param Sesion_id id de la sesion
 * @returns Ganancias acumuladas de la sesion
 * @throws Si ocurre un error
 */
export async function obtenerGanancias(Sesion_id: number): Promise<number> {
    const sesion = await existeSesion(Sesion_id);
    return sesion.Ganancias;
}

// TODO: pensar y hacer la tabla de ganancias
// TODO: hacer el type de ganancias en tablas.d.ts
// TODO: actualizar las funciones con la tabla de ganancias

/**
 * Funcion para obtener las ganancias acumuladas de un socio en un grupo.
 * @param Grupo_id Id del grupo.
 * @param Socio_id Id del socio.
 * @returns El total de ganancias en dinero de un socio en un grupo.
 * @throws Error si los datos no son validos.
 */
export async function obtenerGananciasAcumuladasGrupoSocio(Grupo_id: number, Socio_id: number): Promise<number> {
    let query = `
    Select sum(Ganancia) as Ganancia
    FROM ganancias
    WHERE Grupo_id = ?
    AND Socio_id = ?
    AND repartida = 0
    `;

    const ganancias = (await db.query(query, [Grupo_id, Socio_id]) as [{ Ganancia: number }[], any])[0][0];

    return ganancias.Ganancia;
}

/**
 * Funcion para repartir las ganancias de la sesion actual.
 * @param Grupo_id Id del grupo.
 * @returns void
 * @throws Error si los datos no son validos.
 */
export async function repartirGanancias(Grupo_id: number): Promise<void> {
    const sesionActual = await obtenerSesionActual(Grupo_id);
    const sociosEnGrupo = await obtenerSociosGrupo(Grupo_id);

    const ganancias = await obtenerGanancias(sesionActual.Sesion_id!);

    for (const grupoSocio of sociosEnGrupo) {
        const camposGanancia = {
            Grupo_socio_id: grupoSocio.Grupo_socio_id,
            Ganancia: ganancias * (grupoSocio.Acciones! / sesionActual.Acciones), // 100 de ganancia * (20 acciones del socio / 50 acciones totales) = 40 de ganancia para el socio
            Sesion_id: sesionActual.Sesion_id!
        };

        await db.query("INSERT INTO ganancias SET ?", camposGanancia);
    }
}