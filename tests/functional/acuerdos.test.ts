import { randBoolean, randFutureDate, randNumber, randPhrase, randText } from "@ngneat/falso"
import db from "../../src/config/database";
import { eleccion } from "../../src/utils/utils"
import config from "../config"
import { request } from "../utils/utils";

afterAll(async () => {
    await db.end();
});

describe("Crear Acuerdos", () => {
    const reqBody = {
        Grupo_id: config.Grupo_prueba.id,
        Fecha_acuerdos_fin: randFutureDate(),
        Periodo_reuniones: eleccion(3, 4, 5, 6),
        Periodo_cargos: eleccion(3, 4, 5, 6),
        Limite_inasistencias: eleccion(3, 4, 5, 6),
        Minimo_aportacion: randNumber({ min: 100, max: 100_000 }),
        Costo_acciones: randNumber({ min: 10, max: 100, precision: 10 }),
        Tasa_interes: randNumber({ min: 5, max: 40, fraction: 1 }),
        Limite_credito: randNumber({ min: 100, max: 100_000, precision: 100 }),
        Porcentaje_fondo_comun: randNumber({ min: 5, max: 40, fraction: 1 }),
        Creditos_simultaneos: randNumber({ min: 0, max: 5 }),
        Interes_morosidad: randNumber({ min: 5, max: 40, fraction: 1 }),
        Ampliacion_prestamos: randBoolean(),
        Interes_ampliacion: randNumber({ min: 5, max: 40, fraction: 1 }),
        Mod_calculo_interes: "",
        Tasa_interes_prestamo_grande: randNumber({ min: 5, max: 40, fraction: 1 }),
        Id_socio_administrador: config.Javi.id,
        Id_socio_administrador_suplente: config.Ale.id,
    }

    const reqHeader = {
        Authorization: config.Javi.token
    }

    it("Debería devolver Status 201 si el acuerdo se creó con exito", async () => {

        const response = await request.post(`/api/grupos/${config.Grupo_prueba.id}/acuerdos`)
            .send(reqBody)
            .set(reqHeader);

        expect(response.statusCode).toEqual(201);
    })
})

describe.skip("Crear Acuerdos Secundarios", () => {
    const reqBody = {
        Grupo_id: config.Grupo_prueba.id,
        Regla: randPhrase(),
        Acuerdo: randText({ charCount: 100 }),
        Fecha_acuerdo_fin: randFutureDate(),
    };

    const reqHeader = {
        Authorization: config.Javi.token
    }

    it("Debería devolver Status 201 si el acuerdo secundario se creó con exito", async () => {
        const response = await request.post("/crear_acuerdos_secundarios")
            .send(reqBody)
            .set(reqHeader);

        if(response.statusCode !== 201) {
            console.log(response.body);
            console.log(reqBody);
        }

        expect(response.statusCode).toEqual(201);
    });
})