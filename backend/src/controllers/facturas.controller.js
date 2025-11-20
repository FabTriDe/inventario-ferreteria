const db = require("../config/database");

// 🔹 Obtener con join (factura + proveedor)
exports.obtenerJoin = (req, res) => {
  const sql = `
    SELECT 
      f.idFactura, f.codigo, f.valorFactura, f.fechaFactura,
      p.nombreProveedor, p.nit
    FROM facturas f
    JOIN proveedores p ON f.proveedorId = p.idProveedor
    ORDER BY f.idFactura DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🔹 Crear una factura
exports.agregar = (req, res) => {
  const datos = req.body;
  const columnas = Object.keys(datos).join(", ");
  const valores = Object.values(datos);
  const placeholders = valores.map(() => "?").join(", ");

  const query = `INSERT INTO facturas (${columnas}) VALUES (${placeholders})`;

  db.query(query, valores, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Factura agregada", result });
  });
};

// 🔹 Editar una factura
exports.editar = (req, res) => {
  const { idFactura, ...datos } = req.body;
  if (!idFactura)
    return res.status(400).json({ error: "Se requiere idFactura" });

  const columnas = Object.keys(datos)
    .map((col) => `${col} = ?`)
    .join(", ");
  const valores = [...Object.values(datos), idFactura];

  const query = `UPDATE facturas SET ${columnas} WHERE idFactura = ?`;

  db.query(query, valores, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Factura actualizada", result });
  });
};

// 🔹 Eliminar una factura
exports.eliminar = (req, res) => {
  db.query(
    "DELETE FROM facturas WHERE idFactura = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Factura eliminada" });
    }
  );
};
