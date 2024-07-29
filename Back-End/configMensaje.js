const nodemailer = require("nodemailer");

module.exports = (formulario) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tuemail@gmail.com", // Cambia esto por tu email
      pass: "tupassword", // Cambia esto por tu password
    },
  });

  const mailOptions = {
    from: `"${formulario.nombre} 👻" <${formulario.email}>`,
    to: "destinatario@example.com", // Cambia esto por el destinatario
    subject: formulario.asunto,
    html: `
      <strong>Nombre:</strong> ${formulario.nombre} <br/>
      <strong>E-mail:</strong> ${formulario.email} <br/>
      <strong>Mensaje:</strong> ${formulario.mensaje}
    `,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};
