import { ODataController, Edm, odata, ODataQuery } from "odata-v4-server";
import { createQuery } from "odata-v4-pg";
import convertResults from "./utils/convertResults";
import { Product, Category } from "./model";
import connect from "./connect";
import insert from "./utils/insert";

@odata.type(Product)
export class ProductsController extends ODataController {
	
	@odata.GET
    async select( @odata.query query: ODataQuery ): Promise<Product[]> {
        const db = await connect();
        const sqlQuery = createQuery(query);
        const {rows} = await db.query(sqlQuery.from('"Products"'), sqlQuery.parameters);
		return convertResults(rows);
    }

    @odata.GET
    async selectOne( @odata.key key: number, @odata.query query: ODataQuery ): Promise<Product> {
        const db = await connect();
        const sqlQuery = createQuery(query);
        const {rows} = await db.query(`SELECT ${sqlQuery.select} FROM "Products"
                                        WHERE "Id" = $${sqlQuery.parameters.length + 1} AND (${sqlQuery.where})`,
                                        [...sqlQuery.parameters, key]
                                    );
        return convertResults(rows)[0];
    }

    @odata.GET("Category")
    async getCategory( @odata.result product: Product, @odata.query query: ODataQuery ): Promise<Category> {
        const db = await connect();
        const sqlQuery = createQuery(query);
        const {rows} = await db.query(`SELECT ${sqlQuery.select} FROM "Categories"
                                        WHERE "Id" = $${sqlQuery.parameters.length + 1} AND (${sqlQuery.where})`,
                                        [...sqlQuery.parameters, product.CategoryId]
                                    );
        return rows[0];
    }

    @odata.POST("Category").$ref
    @odata.PUT("Category").$ref
    async setCategory( @odata.key key: number, @odata.link link: number ): Promise<number> {
        const db = await connect();
        const {rowCount} = await db.query(`UPDATE "Products" SET CategoryId = $2 WHERE Id = $1`, [key, link]);
        return rowCount;
    }

    @odata.DELETE("Category").$ref
    async unsetCategory( @odata.key key: number ): Promise<number> {
        const db = await connect();
        const {rowCount} = await db.query(`UPDATE "Products" SET "CategoryId" = NULL WHERE "Id" = $1`, [key]);
        return rowCount;
    }

    @odata.POST
    async insert( @odata.body data: any): Promise<Product> {
        const db = await connect();
        const {rows} = await insert(db, "Products", [data]);
        return convertResults(rows)[0];
    }

    @odata.PUT
    async upsert( @odata.key key: string, @odata.body data: any, @odata.context context: any): Promise<Product> {
    }

    @odata.PATCH
    async update( @odata.key key: string, @odata.body delta: any): Promise<number> {
    }

    @odata.DELETE
    async remove( @odata.key key: string): Promise<number> {
    }
}