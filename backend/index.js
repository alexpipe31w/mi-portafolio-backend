import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const resend = new Resend(process.env.RESEND_API_KEY);

// Ruta para recibir mensajes del frontend
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await resend.emails.send({
      from: "Mi Portafolio <onboarding@resend.dev>", 
      to: "alexpipe31w@gmail.com", // tu correo real
      subject: `Nuevo mensaje de ${name}`,
      html: `<p><b>De:</b> ${name} (${email})</p><p>${message}</p>`,
    });

    res.status(200).json({ success: true, msg: "Mensaje enviado ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Error al enviar el mensaje ❌" });
  }
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
