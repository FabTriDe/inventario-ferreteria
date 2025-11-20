const express = require("express");
const router = express.Router();
const reportesController = require("../controllers/reportes.controller");

router.get("/", reportesController.getAll);
router.get("/:id", reportesController.getById);
router.post("/", reportesController.create);
router.put("/:id", reportesController.update);
router.delete("/:id", reportesController.remove);
router.get("/tipo/:tipo", reportesController.getByTipo);

module.exports = router;
