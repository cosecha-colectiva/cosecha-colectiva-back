import { RowDataPacket } from "mysql2";
import supertest from "supertest";
import app from "../../src/app";
import db from "../../src/config/database";

export const request = supertest(app);