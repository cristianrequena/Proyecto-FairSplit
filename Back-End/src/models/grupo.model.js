//const db = require("../config/db");

const createGroup = async (groupData) => {
  const [result] = await db.query(
    `INSERT INTO grupo (title, description, creator_id, creation_date) VALUES (?, ?, ?, NOW())`,
    [groupData.title, groupData.description, groupData.creator_id]
  );
  return result;
};

const getUserIdByEmail = async (email) => {
  const [rows] = await db.query('SELECT user_id FROM usuario WHERE email = ?', [email]);
  console.log(`Resultado de getUserIdByEmail para ${email}:`, rows);
  return rows.length > 0 ? rows[0].user_id : null;
};

const addGroupMember = async (groupId, userId) => {
  const [result] = await db.query(
    `INSERT INTO grupo_miembro (group_id, user_id) VALUES (?, ?)`,
    [groupId, userId]
  );
  return result;
};

const getGroupById = async (id) => {
  const [group] = await db.query(`SELECT * FROM grupo WHERE group_id = ?`, [id]);
  const [users] = await db.query(`
    SELECT 
        u.user_id,
        u.name,
        u.lastname,
        u.email,
        u.photo,
        COALESCE(SUM(g.amount), 0) AS total_amount,
        COALESCE(p.total_a_pagar, 0) AS total_a_pagar
    FROM 
        proyecto.usuario u
    LEFT JOIN 
        proyecto.grupo_miembro gm ON u.user_id = gm.user_id
    LEFT JOIN 
        proyecto.gasto g ON u.user_id = g.user_id_gasto AND g.group_id = gm.group_id
    LEFT JOIN (
        SELECT 
            pago.user_id, 
            SUM(pago.amount) AS total_a_pagar
        FROM 
            proyecto.pago AS pago
        JOIN 
            proyecto.gasto AS gasto ON pago.expense_id = gasto.expense_id
        WHERE 
            gasto.group_id = ?
            AND pago.user_id != gasto.user_id_gasto
        GROUP BY 
            pago.user_id
    ) p ON u.user_id = p.user_id
    WHERE 
        gm.group_id = ?
    GROUP BY 
        u.user_id, u.name, u.lastname, u.email, u.photo, p.total_a_pagar
`, [id, id]);

  group[0]['participants'] = users;
  const arrayUsers = group[0]['participants'];
  const [gastos] = await db.query(`SELECT u.name, u.lastname, gm.* FROM proyecto.gasto gm JOIN proyecto.usuario u ON gm.user_id_gasto = u.user_id where group_id = ?`, [id]);
  const [pagos] = await db.query(`SELECT 
    pago.user_id_gasto,
    payer.name AS nombre_pagador, 
    payer.lastname AS payer_lastname, 
    pago.user_id, 
	gasto_user.name AS gasto_user_name, 
    gasto_user.lastname AS gasto_user_lastname, 
    pago.payment_id, 
    pago.expense_id, 
    pago.amount, 
    pago.paid_at
FROM 
    proyecto.pago AS pago
JOIN 
    proyecto.gasto AS gasto ON pago.expense_id = gasto.expense_id
JOIN 
    proyecto.usuario AS payer ON pago.user_id = payer.user_id
JOIN 
    proyecto.usuario AS gasto_user ON gasto.user_id_gasto = gasto_user.user_id
WHERE 
    gasto.group_id = ?`, [id]);
  group[0]['gastos'] = gastos;
  group[0]['pagos'] = pagos;

  // Usamos un bucle for...of para manejar promesas correctamente
  for (const element of arrayUsers) {

    // Obtenemos los gastos del usuario de forma asíncrona
    const [gastos_user] = await db.query(`SELECT * FROM proyecto.gasto gm
      JOIN proyecto.usuario u ON gm.user_id_gasto = u.user_id
      WHERE gm.group_id = ? AND gm.user_id_gasto = ?`, [id, element['user_id']]);


    console.log(gastos);
    // Añadimos los gastos al usuario correspondiente
    element['gastos_user'] = gastos_user;
  }
  const [total_amount] = await db.query(`SELECT SUM(amount) AS total_amount FROM proyecto.gasto WHERE group_id = ?`, [id]);
  group[0]['total_amount'] = total_amount[0]['total_amount'];

  return group[0];
};

const getAllGroups = async () => {
  const [rows] = await db.query(`SELECT * FROM grupo`);
  return rows;
};

const getAllGroupsUser = async (id) => {
  const [rows] = await global.db.query(`
    SELECT 
        g.group_id,
        g.title,
        g.creator_id,
        g.description,
        g.creation_date,
        u_creator.url_photo AS creator_url_photo,
        u_creator.photo AS creator_photo,
        IFNULL((SELECT SUM(e.amount) 
                FROM proyecto.gasto e 
                WHERE e.group_id = g.group_id), 0) AS total_amount,
        COUNT(DISTINCT gm2.user_id) AS num_participants,
        IFNULL((SELECT SUM(e.amount)
                FROM proyecto.gasto e
                WHERE e.group_id = g.group_id
                  AND e.user_id_gasto = u.user_id), 0) AS user_inserted_amount,
        IFNULL((SELECT SUM(p.amount)
                FROM proyecto.pago p
                JOIN proyecto.gasto e ON p.expense_id = e.expense_id
                WHERE e.group_id = g.group_id
                  AND p.user_id = u.user_id), 0) AS user_paid_amount,
        IFNULL((SELECT SUM(p.amount)
                FROM proyecto.pago p
                JOIN proyecto.gasto e ON p.expense_id = e.expense_id
                WHERE e.group_id = g.group_id
                  AND p.user_id_gasto = u.user_id), 0) AS user_gasto_amount,
        IFNULL((SELECT SUM(p.amount)
                FROM proyecto.pago p
                JOIN proyecto.gasto e ON p.expense_id = e.expense_id
                WHERE e.group_id = g.group_id
                  AND p.user_id = u.user_id), 0) - IFNULL((SELECT SUM(p.amount)
                FROM proyecto.pago p
                JOIN proyecto.gasto e ON p.expense_id = e.expense_id
                WHERE e.group_id = g.group_id
                  AND p.user_id_gasto = u.user_id), 0) AS balance_difference
    FROM 
        proyecto.usuario u
    JOIN 
        proyecto.grupo_miembro gm ON u.user_id = gm.user_id
    JOIN 
        proyecto.grupo g ON gm.group_id = g.group_id
    LEFT JOIN 
        proyecto.grupo_miembro gm2 ON g.group_id = gm2.group_id
    LEFT JOIN 
        proyecto.usuario u_creator ON g.creator_id = u_creator.user_id
    WHERE 
        u.user_id = ?
    GROUP BY 
        g.group_id, g.title, g.description, g.creation_date, u_creator.url_photo, u_creator.photo;
  `, [id]);
  return rows;
};


const updateGroup = async (id, groupData) => {
  const [result] = await db.query(
    `UPDATE grupo SET title = ?, description = ? WHERE group_id = ?`,
    [groupData.title, groupData.description, id]
  );
  return result;
};

const deleteGroup = async (id) => {
  try {
    await db.query('START TRANSACTION');

    await db.query('SET FOREIGN_KEY_CHECKS = 0');

    const grupoIdQuery = 'SELECT group_id FROM grupo WHERE group_id = ?';
    const [grupoIdRows] = await db.query(grupoIdQuery, [id]);

    if (grupoIdRows.length > 0) {
      const grupoId = grupoIdRows[0].group_id;

      const deletePagosQuery = 'DELETE FROM pago WHERE expense_id IN (SELECT expense_id FROM gasto WHERE group_id = ?)';
      await db.query(deletePagosQuery, [grupoId]);

      const deleteGastosQuery = 'DELETE FROM gasto WHERE group_id = ?';
      await db.query(deleteGastosQuery, [grupoId]);

      const deleteGrupoMiembroQuery = 'DELETE FROM grupo_miembro WHERE group_id = ?';
      await db.query(deleteGrupoMiembroQuery, [grupoId]);

      const deleteGrupoQuery = 'DELETE FROM grupo WHERE group_id = ?';
      const [result] = await db.query(deleteGrupoQuery, [grupoId]);

      await db.query('SET FOREIGN_KEY_CHECKS = 1');

      await db.query('COMMIT');

      console.log(result); 

      return result;
    } else {
      throw new Error(`No se encontró ningún grupo con ID ${id}`);
    }
  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Error en deleteGroup:", error);
    throw error;
  }
};




module.exports = {
  createGroup,
  addGroupMember,
  getUserIdByEmail,
  getGroupById,
  getAllGroups,
  getAllGroupsUser,
  updateGroup,
  deleteGroup,
};