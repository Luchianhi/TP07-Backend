import pool from '../config/db.js';
import * as productRepo from '../repositories/productRepository.js';
import * as categoryRepo from '../repositories/categoryRepository.js';

async function listProducts() {
  return await productRepo.getAll();
}

async function getProduct(id) {
  const product = await productRepo.getById(id);
  if (!product) throw new Error('Product not found');
  return product;
}

async function createProduct(data) {
  // Vérifier que la catégorie existe
  if (data.category_id) {
    const cat = await categoryRepo.getById(data.category_id);
    if (!cat) throw new Error('Invalid category_id');
  }
  return await productRepo.create(data);
}

async function updateProduct(id, data) {
  const existing = await productRepo.getById(id);
  if (!existing) throw new Error('Product not found');
  if (data.category_id) {
    const cat = await categoryRepo.getById(data.category_id);
    if (!cat) throw new Error('Invalid category_id');
  }
  return await productRepo.update(id, data);
}

async function deleteProduct(id) {
  const existing = await productRepo.getById(id);
  if (!existing) throw new Error('Product not found');
  await productRepo.remove(id);
}

async function searchProducts(query) {
  const allowedSort = ['id', 'name', 'price', 'category_id'];
  const sort = allowedSort.includes(query.sort) ? query.sort : 'name';
  return await productRepo.search({...query, sort});
}

async function createProductWithCategory(product, categoryName) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let categoryId;
    if (categoryName) {
      const [catRows] = await connection.execute('SELECT id FROM categories WHERE name = ?', [categoryName]);
      if (catRows.length) {
        categoryId = catRows[0].id;
      } else {
        const [catResult] = await connection.execute('INSERT INTO categories (name) VALUES (?)', [categoryName]);
        categoryId = catResult.insertId;
      }
    }
    const [result] = await connection.execute(
      'INSERT INTO products (name,price,category_id) VALUES (?,?,?)',
      [product.name, product.price, categoryId]
    );
    await connection.commit();
    return {id: result.insertId, ...product, category_id: categoryId};
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}
export {listProducts, getProduct, createProduct, updateProduct, deleteProduct, searchProducts, createProductWithCategory};
