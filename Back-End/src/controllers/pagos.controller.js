const {
  createPago,
  getPagoById,
  getAllPagos,
  updatePago,
  deletePago,
  getPagosByUser,
} = require("../models/pago.model");
const { userBelongsToGroup } = require("../models/usuario.model");

const createPagoHandler = async (req, res) => {
  const { expenseId, userId, amount } = req.body;

  try {
    const pagoExists = await userBelongsToGroup(userId, expenseId);
    if (!pagoExists) {
      return res
        .status(400)
        .json({ message: "El usuario no pertenece al grupo del gasto" });
    }

    const result = await createPago(expenseId, userId, amount);
    res
      .status(201)
      .json({ message: "Pago creado exitosamente", pagoId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPagoByIdHandler = async (req, res) => {
  try {
    const pago = await getPagoById(req.params.id);
    if (!pago) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }
    res.status(200).json(pago);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPagosHandler = async (req, res) => {
  try {
    const pagos = await getAllPagos();
    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePagoHandler = async (req, res) => {
  const { expenseId, userId, amount } = req.body;

  try {
    const pagoExists = await userBelongsToGroup(userId, expenseId);
    if (!pagoExists) {
      return res
        .status(400)
        .json({ message: "El usuario no pertenece al grupo del gasto" });
    }

    const result = await updatePago(req.params.id, {
      expenseId,
      userId,
      amount,
    });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }
    res.status(200).json({ message: "Pago actualizado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePagoHandler = async (req, res) => {
  try {
    const result = await deletePago(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }
    res.status(200).json({ message: "Pago eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPagosByUserHandler = async (req, res) => {
  try {
    const pagos = await getPagosByUser(req.params.userId);
    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPagoHandler,
  getPagoByIdHandler,
  getAllPagosHandler,
  updatePagoHandler,
  deletePagoHandler,
  getPagosByUserHandler,
};
