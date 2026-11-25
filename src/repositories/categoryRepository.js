import pool from '../config/db.js';

async function getAll() {
  const [rows] = await pool.query('SELECT * FROM categories');
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0];
}

async function create(category) {
  const [result] = await pool.execute('INSERT INTO categories (name) VALUES (?)', [category.name]);
  return {id: result.insertId, ...category};
}

async function update(id, category) {
  await pool.execute('UPDATE categories SET name = ? WHERE id = ?', [category.name, id]);
  return {id, ...category};
}

async function remove(id) {
  await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
}

export {getAll, getById, create, update, remove};
