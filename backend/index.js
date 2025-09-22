import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para recibir mensajes del frontend
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Transportador de correo (ejemplo con Gmail)
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Correo que recibirás
    await transporter.sendMail({
      from: email,
      to: "alexpipe31w@gmail.com", // destino (tu correo real)
      subject: `Nuevo mensaje de ${name}`,
      text: message,
      html: `<p><b>De:</b> ${name} (${email})</p><p>${message}</p>`,
    });

    res.status(200).json({ success: true, msg: "Mensaje enviado ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Error al enviar el mensaje ❌" });
  }
});

// Servidor
app.listen(5000, () => console.log("Servidor corriendo en http://localhost:5000"));
