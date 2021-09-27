import {QueryResultRowType, QueryResultType} from "slonik";

export type POJO = { [key: string]: unknown };
export type POJOExtended = { [key: string]: string };
export type RPCMethod = (data: POJO) => Promise<QueryResultType<QueryResultRowType>>;