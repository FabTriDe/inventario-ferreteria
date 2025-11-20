const db = require("../config/database");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const { print } = require("pdf-to-printer");

// Crear PDF de una factura y enviarlo a imprimir
exports.generarPDF = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT f.idFacturaVenta, f.fechaFacturaVenta, 
           v.idProductoVenta, v.cantidad, v.valorUnitario, v.precioTotal, 
           p.nombre AS nombreProducto
    FROM facturasventas f
    JOIN ventas v ON f.idFacturaVenta = v.idFacturaVenta
    JOIN productos p ON v.idProductoVenta = p.idProducto
    WHERE f.idFacturaVenta = ?;
  `;

  db.query(query, [id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ error: "Factura no encontrada" });

    const factura = results[0];
    const ventas = results;

    // Crear PDF
    const doc = new PDFDocument({
      margin: 30,
      size: [210, 3000],
    });

    const filePath = path.join(__dirname, `../temp/factura_${id}.pdf`);

    if (!fs.existsSync(path.join(__dirname, "../temp"))) {
      fs.mkdirSync(path.join(__dirname, "../temp"));
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Encabezado
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Todo en Gas & Algo Más", { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).font("Helvetica").text("COTIZACIÓN", { align: "center" }); // agregado
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Factura #${factura.idFacturaVenta}`, { align: "center" });
    doc.text(`Fecha: ${new Date(factura.fechaFacturaVenta).toLocaleString()}`, {
      align: "center",
    });
    doc.moveDown();

    doc.moveTo(10, doc.y).lineTo(180, doc.y).stroke();

    // Detalles de productos
    let totalFactura = 0;
    doc.moveDown(0.5);
    ventas.forEach((v) => {
      totalFactura += Number(v.precioTotal);
      doc.fontSize(8).text(`[${v.idProductoVenta}] ${v.nombreProducto}`);
      doc.text(
        `${
          v.cantidad
        } x ${v.valorUnitario.toLocaleString()} = ${v.precioTotal.toLocaleString()}`,
        { align: "right" }
      );
      doc.moveDown(1);
    });

    doc.moveTo(10, doc.y).lineTo(180, doc.y).stroke();
    doc.moveDown(1);

    // Total final con margen extra
    doc
      .fontSize(10)
      .text("TOTAL:", { continued: true, underline: true })
      .text(` $${totalFactura.toLocaleString()}`, { align: "right" });

    doc.moveDown(2);
    doc.fontSize(8).text("¡Gracias por su compra!", { align: "center" });

    doc.end();

    // Imprimir automáticamente cuando el PDF esté listo
    stream.on("finish", async () => {
      try {
        await print(filePath);
        fs.unlinkSync(filePath); // eliminar archivo temporal
        res.json({ mensaje: "Factura impresa correctamente" });
      } catch (error) {
        console.error("Error al imprimir:", error);
        res.status(500).json({ error: "No se pudo imprimir la factura" });
      }
    });
  });
};

// Crear nueva factura (solo la fecha, se llena automáticamente)
exports.crear = (req, res) => {
  const query = "INSERT INTO facturasventas () VALUES ()";

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: "Factura creada correctamente",
      idFacturaVenta: result.insertId, // Este ID se usará al crear las ventas
    });
  });
};

// Obtener todas las facturas
exports.obtenerTodas = (req, res) => {
  db.query(
    "SELECT * FROM facturasventas ORDER BY fecha DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// Obtener ventas asociadas a una factura
exports.obtenerVentasPorFactura = (req, res) => {
  const { id } = req.params;
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
    WHERE v.idFacturasVentas = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
