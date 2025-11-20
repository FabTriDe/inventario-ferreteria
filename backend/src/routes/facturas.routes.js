const express = require("express");
const router = express.Router();
const facturasController = require("../controllers/facturas.controller");

router.get("/join", facturasController.obtenerJoin);
router.post("/", facturasController.agregar);
router.put("/", facturasController.editar);
router.delete("/:id", facturasController.eliminar);

module.exports = router;
