import db from "../../src/config/database";
import { grupos_sin_socio } from "../../src/services/Grupos.services";
import { socio_en_grupo } from "../../src/services/Socios.services";
import config from "../config";

afterAll(async () => {
    await db.end();
});

describe("Grupos que no tienen al socio", () => {
    it("should return an array of numbers", async () => {
        const grupos = await grupos_sin_socio(config.Ale.id);
        expect(grupos).toBeInstanceOf(Array);
    });

    it("El socio no debe pertenecer al primer grupo", async () => {
        const grupos = await grupos_sin_socio(config.Ale.id);
        await expect(socio_en_grupo(config.Ale.id, grupos[0])).rejects.not.toBeNull();
    });
});