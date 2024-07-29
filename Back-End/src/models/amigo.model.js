const db = require("../config/db");

const getFriendsAndCommonGroups = async (userId) => {
  const [rows] = await global.db.query(`
    SELECT u.user_id AS _id, u.name, u.lastname, u.email, 
           COALESCE(g.total_grupos_comunes, 0) AS total_grupos_comunes
    FROM amigos a
    JOIN usuario u ON a.friend_id = u.user_id
    LEFT JOIN (
        SELECT gm1.user_id, gm2.user_id AS friend_id, COUNT(*) AS total_grupos_comunes
        FROM grupo_miembro gm1
        JOIN grupo_miembro gm2 ON gm1.group_id = gm2.group_id
        WHERE gm1.user_id = ?
        GROUP BY gm1.user_id, gm2.user_id
    ) g ON a.friend_id = g.friend_id
    WHERE a.user_id = ?
    GROUP BY u.user_id, u.name, u.lastname, u.email;
  `, [userId, userId]);

  return rows;
};



const getUserByEmail = async (email) => {
  try {
    const [user] = await global.db.query(`
      SELECT user_id FROM usuario WHERE email = ?
    `, [email]);

    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error('Error en getUserByEmail:', error.message);
    throw error;
  }
};

const addFriend = async (userId, friendId) => {
  try {
    const [user] = await global.db.query(`
      SELECT user_id FROM usuario WHERE user_id = ?
    `, [userId]);

    if (user.length === 0) {
      console.log('Usuario no encontrado:', userId);
      throw new Error('El usuario con el userId proporcionado no existe');
    }

    const [result] = await global.db.query(`
      INSERT INTO amigos (user_id, friend_id, friendship_date)
      VALUES (?, ?, NOW());
    `, [userId, friendId]);

    console.log('Resultado de la inserción en amigos:', result);

    return { userId, friendId };
  } catch (error) {
    console.error('Error en addFriend:', error.message);
    throw error;
  }
};

const removeFriend = async (userId, friendId) => {
  const [result] = await global.db.query(`
    DELETE FROM amigos WHERE user_id = ? AND friend_id = ?;
  `, [userId, friendId]);

  return result;
};

module.exports = {
  getFriendsAndCommonGroups,
  getUserByEmail,
  addFriend,
  removeFriend
};