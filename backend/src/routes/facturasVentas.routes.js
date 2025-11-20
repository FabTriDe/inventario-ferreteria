const express = require("express");
const router = express.Router();
const facturasVentasController = require("../controllers/facturasVentas.controller");

router.post("/crear", facturasVentasController.crear);
router.get("/", facturasVentasController.obtenerTodas);
router.get("/:id/ventas", facturasVentasController.obtenerVentasPorFactura);
router.get("/pdf/:id", facturasVentasController.generarPDF);

module.exports = router;
