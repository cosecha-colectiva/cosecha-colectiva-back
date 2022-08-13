import db from "../config/database";

/**
 * Obtiene un arreglo con los ids de las multas Pabables en un grupo
 * @param grupo_id Grupo por el cual buscar las multas activas
 * @returns Arreglo con los id de las multas por pagar
 */
export const multasActivas_Grupo = async (grupo_id: number) => {
    const query = `
    SELECT multas.*
    FROM multas
    JOIN sesiones ON sesiones.Sesion_id = multas.Sesion_id
    JOIN grupo_socio ON grupo_socio.Grupo_id = sesiones.Grupo_id AND grupo_socio.Socio_id = multas.Socio_id
    WHERE sesiones.Grupo_id = ? 
        AND multas.\`Status\` = 0 -- Que no esté pagada
        AND grupo_socio.\`Status\` = 1 -- Que este activo
    `;

    const [multas] = await db.query(query, grupo_id) as [Multa[], any];

    return multas.map((multa) => multa.Multa_id) as number[];
}