const express = require("express");
const router = express.Router();
const pagosController = require("../../controllers/pagos.controller");
const { verifyToken } = require("../../helpers/middlewares");

router.post("/", verifyToken, pagosController.createPagoHandler);
router.get("/:id", verifyToken, pagosController.getPagoByIdHandler);
router.get("/", verifyToken, pagosController.getAllPagosHandler);
router.put("/:id", verifyToken, pagosController.updatePagoHandler);
router.delete("/:id", verifyToken, pagosController.deletePagoHandler);
router.get(
  "/usuario/:userId",
  verifyToken,
  pagosController.getPagosByUserHandler
);

module.exports = router;
