"use strict";

const expect = require("chai").expect;
const { ObjectID } = require("mongodb");
const extend = require("extend");

function testCases(NorthwindServer, {Product, Category}, {products, categories}) {

	function createTest(testcase, command, compare, body) {
		it(`${testcase} (${command})`, () => {
			let test = command.split(" ");
			return NorthwindServer.execute(test.slice(1).join(" "), test[0], body).then((result) => {
				expect(result).to.deep.equal(compare);
			});
		});
	}

	createTest.only = function (testcase, command, compare, body) {
		it.only(`${testcase} (${command})`, () => {
			let test = command.split(" ");
			return NorthwindServer.execute(test.slice(1).join(" "), test[0], body).then((result) => {
				/*console.log("==========================");
				console.log(JSON.stringify(result, null, 2));
				console.log(JSON.stringify(compare, null, 2))*/;
				expect(result).to.deep.equal(compare)
			});
		});
	}

	describe("OData V4 MySQL example server", () => {

		beforeEach(() => {
			return NorthwindServer.execute("/initDb", "POST");
		});

		describe("Products", () => {
			createTest("should get all products", "GET /Products", {
				statusCode: 200,
				body: {
					"@odata.context": "http://localhost/$metadata#Products",
					value: products.map(product => extend({
						"@odata.id": `http://localhost/Products('${product.Id}')`,
						"@odata.editLink": `http://localhost/Products('${product.Id}')`
					}, product))
				},
				elementType: Product,
				contentType: "application/json"
			});

			createTest("should get products by filter", "GET /Products?$filter=Name eq 'Chai'", {
				statusCode: 200,
				body: {
					"@odata.context": "http://localhost/$metadata#Products",
					value: products.filter(product => product.Name == "Chai").map(product => extend({
						"@odata.id": `http://localhost/Products('${product.Id}')`,
						"@odata.editLink": `http://localhost/Products('${product.Id}')`
					}, product))
				},
				elementType: Product,
				contentType: "application/json"
			});

			createTest("should get products by filter and select", "GET /Products?$filter=Name eq 'Chai'&$select=Name,UnitPrice", {		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				statusCode: 200,
				body: {
					"@odata.context": "http://localhost/$metadata#Products",
					value: products.filter(product => product.Name == "Chai").map((product) => {
						return {
							"@odata.id": `http://localhost/Products('${product.id}')`,
							"@odata.editLink": `http://localhost/Products('${product.id}')`,
							Name: product.Name,
							UnitPrice: product.UnitPrice,
							id: product.id
						};
					})
				},
				elementType: Product,
				contentType: "application/json"
			});

			createTest("should get product by key", "GET /Products(1)", {
				statusCode: 200,
				body: extend({
					"@odata.context": "http://localhost/$metadata#Products/$entity"
				}, products.filter(product => product.Id == 1).map(product => extend({
					"@odata.id": `http://localhost/Products('${product.Id}')`,
					"@odata.editLink": `http://localhost/Products('${product.Id}')`
				}, product))[0]
				),
				elementType: Product,
				contentType: "application/json"
			});

			it("should create new product", () => {
				return NorthwindServer.execute("/Products", "POST", {
					Name: "New product",
					CategoryId: categories[0].Id
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 201,
						body: {
							"@odata.context": "http://localhost/$metadata#Products/$entity",
							"@odata.id": `http://localhost/Products('${result.body.Id}')`,
							"@odata.editLink": `http://localhost/Products('${result.body.Id}')`,
							Id: result.body.Id,
							Name: "New product",
							CategoryId: categories[0].Id
						},
						elementType: Product,
						contentType: "application/json"
					});
				});
			});

			it("should update product", () => {
				return NorthwindServer.execute("/Products(1)", "PUT", {
					Name: "Chai (updated)"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)", "GET").then((result) => {
						expect(result).to.deep.equal({
							statusCode: 200,
							body: {
								"@odata.context": "http://localhost/$metadata#Products/$entity",
								"@odata.id": `http://localhost/Products('1')`,
								"@odata.editLink": `http://localhost/Products('1')`,
								Name: "Chai (updated)",
								Id: 1
							},
							elementType: Product,
							contentType: "application/json"
						});
					});
				});
			});

			it("should delta update product", () => {
				return NorthwindServer.execute("/Products(1)", "PATCH", {
					Name: "Chai (updated)"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)", "GET").then((result) => {
						expect(result).to.deep.equal({
							statusCode: 200,
							body: products.filter(product => product.Id.toString() == 1).map(product => extend({
								"@odata.context": "http://localhost/$metadata#Products/$entity",
								"@odata.id": `http://localhost/Products('${product.Id}')`,
								"@odata.editLink": `http://localhost/Products('${product.Id}')`
							}, product, {
									Name: "Chai (updated)"
								}))[0],
							elementType: Product,
							contentType: "application/json"
						});
					});
				});
			});

			it("should delete product", () => {
				return NorthwindServer.execute("/Products(1)", "DELETE").then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)", "GET").then(() => {
						throw new Error("Product should be deleted.");
					}, (err) => {
						expect(err.name).to.equal("ResourceNotFoundError");
					});
				});
			});

			createTest("should get category by product", "GET /Products(1)/Category", {
				statusCode: 200,
				body: extend({
					"@odata.context": "http://localhost/$metadata#Categories/$entity"
				}, categories.filter(category => category.Id == 1).map(category => extend({
					"@odata.id": `http://localhost/Categories('${category.Id}')`,
					"@odata.editLink": `http://localhost/Categories('${category.Id}')`
				}, category))[0]
				),
				elementType: Category,
				contentType: "application/json"
			});

			it("should create category reference on product", () => {
				return NorthwindServer.execute("/Products(1)/Category/$ref", "POST", {
					"@odata.id": "http://localhost/Categories(2)"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)/Category", "GET").then((result) => {
						expect(result).to.deep.equal({
							statusCode: 200,
							body: extend({
								"@odata.context": "http://localhost/$metadata#Categories/$entity"
							}, categories.filter(category => category.Id == 2).map(category => extend({
								"@odata.id": `http://localhost/Categories('${category.Id}')`,
								"@odata.editLink": `http://localhost/Categories('${category.Id}')`
							}, category))[0]
							),
							elementType: Category,
							contentType: "application/json"
						})
					});
				});
			});

			it("should update category reference on product", () => {
				return NorthwindServer.execute("/Products(1)/Category/$ref", "PUT", {
					"@odata.id": "http://localhost/Categories(2)"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)/Category", "GET").then((result) => {
						expect(result).to.deep.equal({
							statusCode: 200,
							body: extend({
								"@odata.context": "http://localhost/$metadata#Categories/$entity"
							}, categories.filter(category => category.Id == 2).map(category => extend({
								"@odata.id": `http://localhost/Categories('${category.Id}')`,
								"@odata.editLink": `http://localhost/Categories('${category.Id}')`
							}, category))[0]
							),
							elementType: Category,
							contentType: "application/json"
						})
					});
				});
			});

			it("should delete category reference on product", () => {
				return NorthwindServer.execute("/Products(1)/Category/$ref", "DELETE").then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)/Category", "GET").then((result) => {
						throw new Error("Category reference should be deleted.");
					}, (err) => {
						expect(err.name).to.equal("ResourceNotFoundError");
					});
				});
			});

			createTest("should get the cheapest product", "GET /Products/Northwind.getCheapest()", {
				statusCode: 200,
				body: extend(
					products.filter(product => product.UnitPrice === 2.5).map(product => extend({
						"@odata.id": `http://localhost/Products('${product.Id}')`,
						"@odata.editLink": `http://localhost/Products('${product.Id}')`
					}, product))[0], {
						"@odata.context": "http://localhost/$metadata#Products/$entity"
					}
				),
				elementType: Product,
				contentType: "application/json"
			});

			createTest("should get products in UnitPrice range: 5-8", "GET /Products/Northwind.getInPriceRange(min=5,max=8)", {
				statusCode: 200,
				body: {
					"@odata.context": "http://localhost/$metadata#Products",
					value: products.filter(product => product.UnitPrice >= 5 && product.UnitPrice <= 8).map((product) => {
						return Object.assign({}, product, {
							"@odata.id": `http://localhost/Products('${product.Id}')`,
							"@odata.editLink": `http://localhost/Products('${product.Id}')`,
						});
					})
				},
				elementType: Product,
				contentType: "application/json"
			});

			createTest("should get the price of a product", "GET /Products(1)/Northwind.getUnitPrice()", {
				statusCode: 200,
				body: {
					value: 39,
					"@odata.context": "http://localhost/$metadata#Edm.Decimal"
				},
				elementType: "Edm.Decimal",
				contentType: "application/json"
			});

			it("should invert Discontinued value on a product", () => {
				return NorthwindServer.execute("/Products(76)/Northwind.invertDiscontinued", "POST") //''578f2b8c12eaebabec4af288''->76
					.then((result) => {
						expect(result).to.deep.equal({
							statusCode: 204
						});

						return NorthwindServer.execute("/Products(76)", "GET").then((result) => { //''578f2b8c12eaebabec4af288''->76
							expect(result).to.deep.equal({
								statusCode: 200,
								body: extend({
									"@odata.context": "http://localhost/$metadata#Products/$entity"
								}, products.filter(product => product.Id == 76).map(product => Object.assign({}, product, { //'"578f2b8c12eaebabec4af288"'=>76
									"@odata.id": `http://localhost/Products('${product.Id}')`,
									"@odata.editLink": `http://localhost/Products('${product.Id}')`,
									Discontinued: true
								}))[0]
								),
								elementType: Product,
								contentType: "application/json"
							})
						});
					});
			});

			it("should invert Discontinued value on a product", () => {
				return NorthwindServer.execute("/Products(2)/Northwind.setDiscontinued", "POST", { value: true })
					.then((result) => {
						expect(result).to.deep.equal({
							statusCode: 204
						});

						return NorthwindServer.execute("/Products(2)", "GET").then((result) => {
							expect(result).to.deep.equal({
								statusCode: 200,
								body: extend({
									"@odata.context": "http://localhost/$metadata#Products/$entity"
								}, products.filter(product => product.Id == 2).map(product => Object.assign({}, product, {
									"@odata.id": `http://localhost/Products('${product.Id}')`,
									"@odata.editLink": `http://localhost/Products('${product.Id}')`,
									Discontinued: true
								}))[0]
								),
								elementType: Product,
								contentType: "application/json"
							})
						});
					});
			});

			it("should swap two products UnitPrice", () => {		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				return NorthwindServer.execute("/Products/Northwind.swapPrice", "POST", { a: 74, b: 75 })
					.then((result) => {
						expect(result).to.deep.equal({
							statusCode: 204
						});

						return NorthwindServer.execute("/Products(74)", "GET").then((result) => {
							expect(result).to.deep.equal({
								statusCode: 200,
								body: extend({
									"@odata.context": "http://localhost/$metadata#Products/$entity"
								}, products.filter(product => product.Id.toString() == 74).map(product => Object.assign({}, product, {
									"@odata.id": `http://localhost/Products('${product.Id}')`,
									"@odata.editLink": `http://localhost/Products('${product.Id}')`,
									UnitPrice: 18
								}))[0]
								),
								elementType: Product,
								contentType: "application/json"
							})
						})
							.then(() => {
								return NorthwindServer.execute("/Products(75)", "GET").then((result) => {
									expect(result).to.deep.equal({
										statusCode: 200,
										body: extend({
											"@odata.context": "http://localhost/$metadata#Products/$entity"
										}, products.filter(product => product.Id.toString() == 75).map(product => Object.assign({}, product, {
											"@odata.id": `http://localhost/Products('${product.Id}')`,
											"@odata.editLink": `http://localhost/Products('${product.Id}')`,
											UnitPrice: 7.75
										}))[0]
										),
										elementType: Product,
										contentType: "application/json"
									})
								})
							});
					});
			});

			it("should discount a product", () => {
				return NorthwindServer.execute("/Products/Northwind.discountProduct", "POST", { productId: 3, percent: 10 })
					.then((result) => {
						expect(result).to.deep.equal({
							statusCode: 204
						});

						return NorthwindServer.execute("/Products(3)", "GET").then((result) => {
							expect(result).to.deep.equal({
								statusCode: 200,
								body: extend({
									"@odata.context": "http://localhost/$metadata#Products/$entity"
								}, products.filter(product => product.Id == 3).map(product => Object.assign({}, product, {
									"@odata.id": `http://localhost/Products('${product.Id}')`,
									"@odata.editLink": `http://localhost/Products('${product.Id}')`,
									UnitPrice: 9
								}))[0]
								),
								elementType: Product,
								contentType: "application/json"
							})
						})
					});
			});
		});

		describe.only("Categories", () => {
			createTest("should get all categories", "GET /Categories", {
				statusCode: 200,
				body: {
					"@odata.context": "http://localhost/$metadata#Categories",
					value: categories.map(category => extend({
						"@odata.id": `http://localhost/Categories('${category.Id}')`,
						"@odata.editLink": `http://localhost/Categories('${category.Id}')`
					}, category))
				},
				elementType: Category,
				contentType: "application/json"
			});

			createTest("should get categories by filter", "GET /Categories?$filter=Name eq 'Beverages'", {
				statusCode: 200,
				body: {
					"@odata.context": "http://localhost/$metadata#Categories",
					value: categories.filter(category => category.Name == "Beverages").map(category => extend({
						"@odata.id": `http://localhost/Categories('${category.Id}')`,
						"@odata.editLink": `http://localhost/Categories('${category.Id}')`
					}, category))
				},
				elementType: Category,
				contentType: "application/json"
			});

			createTest.only("should get categories by filter and select", "GET /Categories?$filter=Name eq 'Beverages'&$select=Name,Description", {		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				statusCode: 200,
				body: {
					"@odata.context": "http://localhost/$metadata#Categories",
					value: categories.filter(category => category.Name == "Beverages").map((category) => {
						return {
							"@odata.id": `http://localhost/Categories('${category.Id}')`,
							"@odata.editLink": `http://localhost/Categories('${category.Id}')`,
							Name: category.Name,
							Description: category.Description
						};
					})
				},
				elementType: Category,
				contentType: "application/json"
			});

			createTest("should get category by key", "GET /Categories(1)", {
				statusCode: 200,
				body: extend({
					"@odata.context": "http://localhost/$metadata#Categories/$entity"
				}, categories.filter(category => category.Id == 1).map(category => extend({
					"@odata.id": `http://localhost/Categories('${category.Id}')`,
					"@odata.editLink": `http://localhost/Categories('${category.Id}')`
				}, category))[0]
				),
				elementType: Category,
				contentType: "application/json"
			});

			it("should create new category", () => {
				return NorthwindServer.execute("/Categories", "POST", {
					Name: "New category",
					Description: "Test category"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 201,
						body: {
							"@odata.context": "http://localhost/$metadata#Categories/$entity",
							"@odata.id": `http://localhost/Categories('${result.body.Id}')`,
							"@odata.editLink": `http://localhost/Categories('${result.body.Id}')`,
							Id: result.body.Id,
							Name: "New category",
							Description: "Test category"
						},
						elementType: Category,
						contentType: "application/json"
					});
				});
			});

			it("should update category", () => {		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				return NorthwindServer.execute("/Categories(1)", "PUT", {
					Name: "Beverages (updated)"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Categories(1)", "GET").then((result) => {
						expect(result).to.deep.equal({
							statusCode: 200,
							body: {
								"@odata.context": "http://localhost/$metadata#Categories/$entity",
								"@odata.id": `http://localhost/Categories(1)`,
								"@odata.editLink": `http://localhost/Categories(1)`,
								Name: "Beverages (updated)",
								Id: 1
							},
							elementType: Category,
							contentType: "application/json"
						});
					});
				});
			});

			it("should delta update category", () => {		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				return NorthwindServer.execute("/Categories(1)", "PATCH", {
					Name: "Beverages (updated)"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Categories(1)", "GET").then((result) => {
						expect(result).to.deep.equal({
							statusCode: 200,
							body: categories.filter(category => category.id == 1).map(category => extend({
								"@odata.context": "http://localhost/$metadata#Categories/$entity",
								"@odata.id": `http://localhost/Categories('${category.id}')`,
								"@odata.editLink": `http://localhost/Categories('${category.id}')`
							}, category, {
									Name: "Beverages (updated)"
								}))[0],
							elementType: Category,
							contentType: "application/json"
						});
					});
				});
			});

			it("should delete category", () => {
				return NorthwindServer.execute("/Categories(1)", "DELETE").then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Categories(1)", "GET").then(() => {
						throw new Error("Product should be deleted.");
					}, (err) => {
						expect(err.name).to.equal("ResourceNotFoundError");
					});
				});
			});

			createTest("should get products by category", "GET /Categories(1)/Products", {
				statusCode: 200,
				body: {
					"@odata.context": "http://localhost/$metadata#Categories(1)/Products",
					value: products.filter(product => product.CategoryId == 1).map(product => extend({
						"@odata.id": `http://localhost/Products('${product.Id}')`,
						"@odata.editLink": `http://localhost/Products('${product.Id}')`
					}, product))
				},
				elementType: Product,
				contentType: "application/json"
			});

			it("should create product reference on category", () => {
				return NorthwindServer.execute("/Categories(2)/Products/$ref", "POST", {
					"@odata.id": "http://localhost/Products(1)"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)/Category", "GET").then((result) => {
						expect(result).to.deep.equal({
							statusCode: 200,
							body: extend({
								"@odata.context": "http://localhost/$metadata#Categories/$entity"
							}, categories.filter(category => category.Id == 2).map(category => extend({
								"@odata.id": `http://localhost/Categories('${category.Id}')`,
								"@odata.editLink": `http://localhost/Categories('${category.Id}')`
							}, category))[0]
							),
							elementType: Category,
							contentType: "application/json"
						})
					});
				});
			});

			it("should update product reference on category", () => {
				return NorthwindServer.execute("/Categories(2)/Products/$ref", "PUT", {
					"@odata.id": "http://localhost/Products(1)"
				}).then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)/Category", "GET").then((result) => {
						expect(result).to.deep.equal({
							statusCode: 200,
							body: extend({
								"@odata.context": "http://localhost/$metadata#Categories/$entity"
							}, categories.filter(category => category.Id == 2).map(category => extend({
								"@odata.id": `http://localhost/Categories('${category.Id}')`,
								"@odata.editLink": `http://localhost/Categories('${category.Id}')`
							}, category))[0]
							),
							elementType: Category,
							contentType: "application/json"
						})
					});
				});
			});

			it("should delete product reference on category", () => {
				return NorthwindServer.execute("/Categories('578f2baa12eaebabec4af289')/Products/$ref?$id=http://localhost/Products(1)", "DELETE").then((result) => {
					expect(result).to.deep.equal({
						statusCode: 204
					});

					return NorthwindServer.execute("/Products(1)/Category", "GET").then((result) => {
						throw new Error("Category reference should be deleted.");
					}, (err) => {
						expect(err.name).to.equal("ResourceNotFoundError");
					});
				});
			});
		});
	});
}

module.exports = testCases;