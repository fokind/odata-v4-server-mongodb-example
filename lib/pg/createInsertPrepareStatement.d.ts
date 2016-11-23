/**
 * This function provides a statement string such as:
 * ($1:int, $2:varchar, $3:boolean),
 * ($2:int, $3:varchar, $4:boolean),
 * ($5:int, $5:varchar, $7:boolean)
 *
 * The parameters are The
 * 	1) the items in Object[] format: [{Id: 1, Name: 'foo', Active: true}]
 * 	2) the types in String[] format: ['int', 'varchar', 'boolean']
 */
export default function (items: any[], types: string[]): string;
