const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventas.controller");

router.get("/join", ventasController.obtenerTodosJoin);
router.get("/", ventasController.obtenerTodos);
router.get("/:id", ventasController.obtenerPorId);
router.post("/", ventasController.agregar);
router.put("/", ventasController.editar);
router.delete("/:id", ventasController.eliminar);

module.exports = router;
