const db = require("../config/database");

// Obtener todos los reportes
exports.getAll = (req, res) => {
  db.query("SELECT * FROM reportes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtener reporte por ID
exports.getById = (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM reportes WHERE idReporte = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || null);
    }
  );
};

// Crear un reporte
exports.create = (req, res) => {
  const data = req.body;
  const query = `INSERT INTO reportes (${Object.keys(data).join(
    ", "
  )}) VALUES (${Object.keys(data)
    .map(() => "?")
    .join(", ")})`;
  db.query(query, Object.values(data), (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Reporte creado correctamente", result });
  });
};

// Actualizar un reporte
exports.update = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = `UPDATE reportes SET ${Object.keys(data)
    .map((k) => `${k}=?`)
    .join(", ")} WHERE idReporte=?`;
  db.query(query, [...Object.values(data), id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Reporte actualizado correctamente", result });
  });
};

// Eliminar un reporte
exports.remove = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM reportes WHERE idReporte = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Reporte eliminado correctamente", result });
  });
};

// Obtener reportes por tipo
exports.getByTipo = (req, res) => {
  const tipo = req.params.tipo;
  db.query("SELECT * FROM reportes WHERE tipo = ?", [tipo], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
