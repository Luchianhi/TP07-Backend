// Étape 16 — Gestion Centralisée des Erreurs (dernier middleware dans index.js)
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  // Comportement du LAB 6 conservé pour les erreurs métier
  const status = err.message.includes('not found') ? 404 : 400;
  res.status(status).json({error: err.message});
}
export default errorHandler;
