const express = require("express");
const router = express.Router();
const trabajosController = require("../controllers/trabajos.controller");

router.get("/:id", trabajosController.getById);
router.get("/", trabajosController.getAll);
router.post("/", trabajosController.create);
router.put("/:id", trabajosController.update);
router.delete("/:id", trabajosController.remove);

module.exports = router;
