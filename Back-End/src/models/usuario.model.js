//const db = require("../config/db");
const bcrypt = require("bcryptjs");

const createUser = async (name, lastname, email, photo, hashedPassword) => {
  const [result] = await db.query(
    "INSERT INTO usuario (name, lastname, email, photo, password, verified) VALUES (?, ?, ?, ?, ?, 0)",
    [name, lastname, email, photo, hashedPassword]
  );
  return result;
};

const removeGroupMember = async (groupId, userId) => {
  const [result] = await db.query(
    "DELETE FROM grupo_miembro WHERE group_id = ? AND user_id = ?",
    [groupId, userId]
  );
  return result;
};

const getAllUsers = async () => {
  const [rows] = await db.query("SELECT * FROM usuario");
  return rows;
};

const getUserById = async (id) => {
  const [rows] = await db.query("SELECT * FROM usuario WHERE user_id = ?", [
    id,
  ]);
  return rows[0];
};

const updateUser = async (id, updateData) => {
  const {
    name,
    lastname,
    email,
    photo_url,
    password,
    group_id,
    payment_percentage,
    debt,
  } = updateData;
  let query =
    "UPDATE usuario SET name = ?, lastname = ?, email = ?, url_photo = ? WHERE user_id = ?";
  let updateFields = [name, lastname, email, photo_url, id];

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 8);
    query =
      "UPDATE usuario SET name = ?, lastname = ?, email = ?, url_photo = ?, password = ? WHERE user_id = ?";
    updateFields = [name, lastname, email, photo_url, hashedPassword, id];
  }

  const [result] = await db.query(query, updateFields);
  return result;
};

const deleteUser = async (id) => {
  const [result] = await db.query("DELETE FROM usuario WHERE user_id = ?", [
    id,
  ]);
  return result;
};

const getUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [
    email,
  ]);
  return rows[0];
};

const groupExists = async (groupId) => {
  const [rows] = await db.query("SELECT * FROM grupo WHERE group_id = ?", [
    groupId,
  ]);
  return rows.length > 0;
};

// Nueva función para actualizar campos específicos del usuario
const updateUserFields = async (id, fields) => {
  const setClause = Object.keys(fields)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(fields);
  values.push(id);
  await db.query(`UPDATE usuario SET ${setClause} WHERE user_id = ?`, values);
};

module.exports = {
  createUser,
  removeGroupMember,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmail,
  groupExists,
  updateUserFields,
};
