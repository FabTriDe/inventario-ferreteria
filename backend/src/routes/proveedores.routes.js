const express = require("express");
const router = express.Router();
const proveedoresController = require("../controllers/proveedores.controller");

router.get("/", proveedoresController.getAll);
router.get("/:id", proveedoresController.getById);
router.post("/", proveedoresController.create);
router.put("/:id", proveedoresController.update);
router.delete("/:id", proveedoresController.remove);

module.exports = router;
