const db = require("../config/database");

// Obtener todos los trabajos

// Obtener trabajo por ID
exports.getById = (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM trabajos WHERE idTrabajo = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || null); // Devuelve null si no existe
    }
  );
};

exports.getAll = (req, res) => {
  db.query("SELECT * FROM trabajos", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear un nuevo trabajo
exports.create = (req, res) => {
  const data = req.body;
  const query = `INSERT INTO trabajos (${Object.keys(data).join(
    ", "
  )}) VALUES (${Object.keys(data)
    .map(() => "?")
    .join(", ")})`;
  db.query(query, Object.values(data), (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Trabajo agregado correctamente", result });
  });
};

// Actualizar un trabajo
exports.update = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = `UPDATE trabajos SET ${Object.keys(data)
    .map((k) => `${k}=?`)
    .join(", ")} WHERE idTrabajo=?`;
  db.query(query, [...Object.values(data), id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Trabajo actualizado correctamente", result });
  });
};

// Eliminar un trabajo
exports.remove = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM trabajos WHERE idTrabajo = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Trabajo eliminado correctamente", result });
  });
};
