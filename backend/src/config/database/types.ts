export interface Database {
    connect(): Promise<void>;
    query<T=any>(sql:string, params ?: any[]):Promise<T[]>;
    close():Promise<void>
}