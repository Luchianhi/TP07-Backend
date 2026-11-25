import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_dev';

// Étape 8 — Endpoint d'Inscription (Register)
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ? OR username = ?', [email, username]
  );
  if (existing.length > 0) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashedPassword = await hashPassword(password);
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );

  res.status(201).json({ message: 'User created successfully', id: result.insertId });
};

// Exercice niveau 3 — log d'activité pour chaque tentative de login échouée
const logFailedLogin = async (req, email) => {
  try {
    await pool.execute(
      'INSERT INTO login_logs (email, ip_address) VALUES (?, ?)',
      [email ?? null, req.ip ?? null]
    );
  } catch (err) {
    console.error('Failed to write login log:', err.message);
  }
};

// Étape 9 — Endpoint de Connexion (Login)
export const login = async (req, res) => {
  const { email, password } = req.body;
  const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

  if (users.length === 0) {
    await logFailedLogin(req, email);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = users[0];
  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    await logFailedLogin(req, email);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, role: user.role });
};

// Étape 10 — Endpoint Profil (Me)
export const getMe = async (req, res) => {
  const userId = req.user.id; // Injecté par le middleware authenticate

  const [users] = await pool.execute(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(users[0]);
};

// Exercice niveau 1 — POST /api/auth/refresh : générer un nouveau token
export const refresh = async (req, res) => {
  const [users] = await pool.execute(
    'SELECT id, role FROM users WHERE id = ?',
    [req.user.id]
  );

  if (users.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = users[0];
  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, role: user.role });
};

// Exercice niveau 2 — DELETE /api/auth/me : suppression d'un compte utilisateur
export const deleteMe = async (req, res) => {
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [req.user.id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(204).send();
};
