const express = require("express");
const router = express.Router();
const userController = require("../../controllers/usuarios.controller");
const { verifyToken, isAdmin } = require("../../helpers/middlewares");

router.post("/register", userController.registerUser); // Ruta de registro
router.post("/login", userController.loginUser); // Ruta de login
router.post("/request-password-reset", userController.requestPasswordReset); // Solicitar restablecimiento de contraseña
router.post("/reset-password", userController.resetPassword); // Restablecer contraseña

router.get("/", verifyToken, userController.getAllUsersHandler);
router.get("/:id", verifyToken, userController.getUserByIdHandler);
router.get("/:id/email", verifyToken, userController.getEmailByUserIdHandler);
router.put("/:id", verifyToken, userController.updateUserHandler);
router.delete("/:id", verifyToken, isAdmin, userController.deleteUserHandler);

// Rutas de grupo
router.post("/:id/grupo", verifyToken, userController.addUserToGroup);
router.delete(
  "/:id/grupo/:groupId",
  verifyToken,
  userController.removeUserFromGroup
);

// Ruta para verificar la contraseña
router.post("/verify-password", verifyToken, userController.verifyPassword);

module.exports = router;
