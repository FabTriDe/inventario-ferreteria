const express = require("express");
const cors = require("cors");
const path = require("path");
const { upload } = require("./utils/cloudinary");

const app = express();

// Configuración CORS
app.use(
  cors({
    origin: [
      "https://inventario-ferreteria-production.up.railway.app",
      "http://localhost:4200",
    ],
  })
);

app.use(express.json());

// =======================
// Rutas principales
// =======================
app.use("/api/productos", require("./routes/productos.routes"));
app.use("/api/facturas", require("./routes/facturas.routes"));
app.use("/api/ventas", require("./routes/ventas.routes"));
app.use("/api/trabajos", require("./routes/trabajos.routes"));
app.use("/api/proveedores", require("./routes/proveedores.routes"));
app.use("/api/reportes", require("./routes/reportes.routes"));
app.use("/api/facturas-ventas", require("./routes/facturasVentas.routes"));

// =======================
// Cloudinary Upload
// =======================
app.post("/api/upload-image", upload.single("imagen"), (req, res) => {
  if (!req.file || !req.file.path)
    return res.status(400).json({ error: "No se pudo subir la imagen" });
  res.json({ imageUrl: req.file.path });
});

// =======================
// Servir Angular Build
// =======================
app.use(
  express.static(
    path.join(__dirname, "../../dist/inventario-ferreteria/browser")
  )
);

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../dist/inventario-ferreteria/browser/index.html")
  );
});

module.exports = app;
