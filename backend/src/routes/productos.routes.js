const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productos.controller");

router.get("/ultimo-id", productosController.obtenerUltimoId);
router.get("/sin-tornillos", productosController.obtenerSinTornillos);
router.get("/tipo/:tipo", productosController.obtenerPorTipo);
router.get("/", productosController.obtenerTodos);
router.get("/:id", productosController.obtenerPorId);
router.post("/", productosController.agregar);
router.put("/", productosController.editar);
router.delete("/:id", productosController.eliminar);

module.exports = router;
