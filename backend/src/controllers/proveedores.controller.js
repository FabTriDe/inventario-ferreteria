const db = require("../config/database");

// Obtener todos los proveedores
exports.getAll = (req, res) => {
  db.query("SELECT * FROM proveedores", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtener proveedor por ID
exports.getById = (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM proveedores WHERE idProveedor = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || null);
    }
  );
};

// Crear un proveedor
exports.create = (req, res) => {
  const data = req.body;
  const query = `INSERT INTO proveedores (${Object.keys(data).join(
    ", "
  )}) VALUES (${Object.keys(data)
    .map(() => "?")
    .join(", ")})`;
  db.query(query, Object.values(data), (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Proveedor agregado correctamente", result });
  });
};

// Actualizar un proveedor
exports.update = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = `UPDATE proveedores SET ${Object.keys(data)
    .map((k) => `${k}=?`)
    .join(", ")} WHERE idProveedor=?`;
  db.query(query, [...Object.values(data), id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Proveedor actualizado correctamente", result });
  });
};

// Eliminar un proveedor
exports.remove = (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM proveedores WHERE idProveedor = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Proveedor eliminado correctamente", result });
    }
  );
};
