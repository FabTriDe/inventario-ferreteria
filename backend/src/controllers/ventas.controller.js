const db = require("../config/database");

// 🔹 Obtener todas las ventas con nombre del producto
exports.obtenerTodosJoin = (req, res) => {
  const query = `
    SELECT 
      v.idVenta,
      v.idProductoVenta,
      p.nombre AS nombreProducto,
      v.cantidad,
      v.valorUnitario,
      v.precioTotal,
      v.fechaVenta
    FROM ventas v
    JOIN productos p ON v.idProductoVenta = p.idProducto
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🔹 Obtener venta por ID
exports.obtenerPorId = (req, res) => {
  db.query(
    "SELECT * FROM ventas WHERE idVenta = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || { error: "No encontrado" });
    }
  );
};

// 🔹 Obtener todas las ventas
exports.obtenerTodos = (req, res) => {
  db.query("SELECT * FROM ventas", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🔹 Crear nueva venta (puede venir con o sin idFacturasVentas)
exports.agregar = (req, res) => {
  const data = req.body;

  // Verificamos si viene idFacturaVenta (si no, se deja como NULL)
  if (!data.idFacturaVenta) {
    data.idFacturaVenta = null;
  }

  const columnas = Object.keys(data).join(", ");
  const placeholders = Object.keys(data)
    .map(() => "?")
    .join(", ");
  const valores = Object.values(data);

  const query = `INSERT INTO ventas (${columnas}) VALUES (${placeholders})`;

  db.query(query, valores, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Venta registrada correctamente", result });
  });
};

// 🔹 Editar venta
exports.editar = (req, res) => {
  const { idVenta, ...data } = req.body;
  if (!idVenta)
    return res.status(400).json({ error: "Se requiere idVenta para editar" });

  const columnas = Object.keys(data)
    .map((k) => `${k}=?`)
    .join(", ");
  const valores = [...Object.values(data), idVenta];

  const query = `UPDATE ventas SET ${columnas} WHERE idVenta=?`;

  db.query(query, valores, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Venta actualizada correctamente", result });
  });
};

// 🔹 Eliminar venta
exports.eliminar = (req, res) => {
  db.query(
    "DELETE FROM ventas WHERE idVenta = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Venta eliminada correctamente" });
    }
  );
};
