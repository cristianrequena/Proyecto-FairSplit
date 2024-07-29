const express = require("express");
const router = express.Router();
const gastosController = require("../../controllers/gastos.controller");
const { verifyToken } = require("../../helpers/middlewares");

router.post("/", verifyToken, gastosController.createGastoHandler);
router.get("/:id", verifyToken, gastosController.getGastoByIdHandler);
router.get("/", verifyToken, gastosController.getAllGastosHandler);
router.put("/:id", verifyToken, gastosController.updateGastoHandler);
router.delete("/:id", verifyToken, gastosController.deleteGastoHandler);

module.exports = router;
