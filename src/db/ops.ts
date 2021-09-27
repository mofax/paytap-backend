import type {KnownModels, ModelType} from "./zod";
import * as models from './zod';
import {slonikPool} from "./slonik";
import {sql} from "slonik";
import {POJO} from "./types";
import {ZodString} from "zod";
import {logger} from "../logger";

export function insert(tableName: KnownModels, data: POJO) {
    const model: ModelType = models[tableName];
    const columns = Object.keys(data).join(",");
    const valuesPrepare = Object.keys(data).map((c) => {
        const parser = model.fields[c]
        if (parser instanceof ZodString) {
            return `'${data[c]}'`
        }
        return data[c]
    })

    const values = valuesPrepare.join(',');

    return slonikPool.connect(async (connection) => {
        try {
            const query = sql`INSERT INTO ${tableName}(${columns}) VALUES (${values})`;
            logger.debug(query)
            return await connection.query(query);
        } catch (err) {
            if (err.originalError) {
                console.log(err.originalError)
            }
            throw err;
        }
    })
}

export function selectById(tableName: KnownModels, id: string) {
    return slonikPool.connect(async (connection) => {
        return await connection.query(sql`SELECT * from ${tableName} where id=${id}`);
    })
}

export function select(tableName: KnownModels, filter: POJO) {
    console.log(filter)
    return slonikPool.connect(async (connection) => {
        return await connection.query(sql`SELECT * from ${tableName}`);
    })
}