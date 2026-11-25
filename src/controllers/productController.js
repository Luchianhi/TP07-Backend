import * as productService from '../services/productService.js';

async function getAll(req, res, next) {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const product = await productService.getProduct(req.params.id);
    res.json(product);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function search(req, res, next) {
  try {
    const products = await productService.searchProducts(req.query);
    res.json(products);
  } catch (err) { next(err); }
}

async function createWithCategory(req, res, next) {
  try {
    const {categoryName, ...product} = req.body;
    const created = await productService.createProductWithCategory(product, categoryName);
    res.status(201).json(created);
  } catch (err) { next(err); }
}
export {getAll, getOne, create, update, remove, search, createWithCategory};
