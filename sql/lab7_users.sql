USE lab_product;

-- Étape 6 — Création de la table users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercice niveau 3 — journal des tentatives de login échouées
CREATE TABLE login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
