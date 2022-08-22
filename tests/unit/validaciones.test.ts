import supertest from "supertest";
import app from "../../src/app";
import db from "../../src/config/database";
import { validar_password } from "../../src/utils/validaciones";
import config from "../config";

const request = supertest(app);

afterAll(async () => {
    await db.end();
});

describe("Validar Password", () => {
    it("should be valid", async () => {
        expect(await validar_password(config.Javi.id, config.Javi.password)).toBe(true);
    });

    it("should be invalid", async () => {
        expect(await validar_password(config.Javi.id, config.Javi.password + " ")).toBe(false);
    });
});

