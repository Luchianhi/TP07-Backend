import pool from '../config/db.js';

async function getAll() {
  const [rows] = await pool.query('SELECT * FROM products');
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
}

async function create(product) {
  const {name, price, category_id} = product;
  const [result] = await pool.execute(
    'INSERT INTO products (name,price,category_id) VALUES (?,?,?)',
    [name, price, category_id]
  );
  return {id: result.insertId, ...product};
}

async function update(id, product) {
  const {name, price, category_id} = product;
  await pool.execute(
    'UPDATE products SET name = ?, price = ?, category_id = ? WHERE id = ?',
    [name, price, category_id, id]
  );
  return {id, ...product};
}

async function remove(id) {
  await pool.execute('DELETE FROM products WHERE id = ?', [id]);
}

async function search({name, minPrice, maxPrice, categoryId, limit=10, offset=0, sort='name'}) {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (name) { sql += ' AND name LIKE ?'; params.push(`%${name}%`); }
  if (minPrice) { sql += ' AND price >= ?'; params.push(minPrice); }
  if (maxPrice) { sql += ' AND price <= ?'; params.push(maxPrice); }
  if (categoryId) { sql += ' AND category_id = ?'; params.push(categoryId); }
  sql += ` ORDER BY ${sort} LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  const [rows] = await pool.execute(sql, params);
  return rows;
}
export {getAll, getById, create, update, remove, search};
