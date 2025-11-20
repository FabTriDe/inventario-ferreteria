const db = require("../config/database");

exports.obtenerUltimoId = (req, res) => {
  const tipo = req.query.tipo;
  if (!tipo) return res.status(400).json({ error: "Falta el parámetro tipo" });

  const sql = `
    SELECT idProducto 
    FROM productos 
    WHERE idProducto LIKE ? 
    ORDER BY CAST(SUBSTRING_INDEX(idProducto, '-', -1) AS UNSIGNED) DESC 
    LIMIT 1
  `;

  db.query(sql, [`${tipo}-%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) return res.json({ nuevoId: `${tipo}-1` });

    const ultimoId = rows[0].idProducto;
    const numero = parseInt(ultimoId.split("-")[1]) + 1;
    const nuevoId = `${tipo}-${numero}`;

    res.json({ nuevoId });
  });
};

exports.obtenerPorId = (req, res) => {
  db.query(
    "SELECT * FROM productos WHERE idProducto = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || { error: "No encontrado" });
    }
  );
};

exports.obtenerPorTipo = (req, res) => {
  db.query(
    "SELECT * FROM productos WHERE tipo = ?",
    [req.params.tipo],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

exports.obtenerSinTornillos = (req, res) => {
  db.query(
    "SELECT * FROM productos WHERE tipo != 'tornillo'",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

exports.obtenerTodos = (req, res) => {
  db.query("SELECT * FROM productos", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.agregar = (req, res) => {
  const datos = req.body;
  const columnas = Object.keys(datos).join(", ");
  const valores = Object.values(datos);
  const placeholders = valores.map(() => "?").join(", ");

  const query = `INSERT INTO productos (${columnas}) VALUES (${placeholders})`;

  db.query(query, valores, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Producto agregado", result });
  });
};

exports.editar = (req, res) => {
  const { idProducto, ...datos } = req.body;
  if (!idProducto)
    return res.status(400).json({ error: "Se requiere idProducto" });

  const columnas = Object.keys(datos)
    .map((col) => `${col} = ?`)
    .join(", ");
  const valores = [...Object.values(datos), idProducto];

  const query = `UPDATE productos SET ${columnas} WHERE idProducto = ?`;

  db.query(query, valores, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Producto actualizado", result });
  });
};

exports.eliminar = (req, res) => {
  db.query(
    "DELETE FROM productos WHERE idProducto = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Producto eliminado" });
    }
  );
};
