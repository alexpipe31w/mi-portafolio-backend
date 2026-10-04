import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import Groq from "groq-sdk";

// gpt-oss responde con mucho Markdown y el widget lo pinta como texto plano.
const PLAIN_TEXT_RULE =
  'Formato: el chat muestra texto plano, no Markdown. No uses asteriscos, almohadillas, tablas ni barras verticales; usa frases cortas, saltos de línea, guiones simples y emojis.';

// Red de seguridad: aunque el prompt pide texto plano, gpt-oss a veces cuela negritas.
function stripMarkdown(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#{1,6}\s+/gm, '');
}

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar servicios
const resend = new Resend(process.env.RESEND_API_KEY);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Contexto del portfolio para el chatbot
const PORTFOLIO_CONTEXT = `Eres el asistente virtual de Alex Felipe Rodríguez Palomino, estudiante de Ingeniería de Software y Full-Stack Developer.

INFORMACIÓN PERSONAL:
- Nombre: Alex Felipe Rodríguez Palomino
- Ubicación: Neiva, Huila, Colombia
- Email: alexpipe31w@gmail.com
- Teléfono/WhatsApp: +57 3142378407
- GitHub: https://github.com/alexpipe31w
- LinkedIn: https://www.linkedin.com/in/alex-felipe-rodriguez-b45778360
- Portfolio: https://alex-rodriguez-portfol.vercel.app/
- Disponibilidad: Abierto a proyectos freelance y trabajo remoto

PERFIL PROFESIONAL:
Estudiante de Ingeniería de Software con experiencia práctica en desarrollo full-stack, especializado en React, Next.js, Node.js y TypeScript. Fuerte conocimiento en Python, Django, SQL, Linux y pruebas de software (manuales y automatizadas). Enfoque en construir experiencias digitales modernas, seguras y eficientes.

STACK TECNOLÓGICO:
Frontend:
- React (90%) - Next.js, Vite
- TypeScript (80%)
- TailwindCSS, CSS, HTML
- Animaciones avanzadas y efectos parallax

Backend:
- Node.js (85%) - Express, Next.js API Routes
- Python (85%) - Django, Flask
- API REST, integración de terceros

Bases de Datos:
- SQL (80%) - MySQL, SQLAlchemy
- Diseño de bases de datos relacionales

DevOps & Tools:
- Linux (70%)
- Git & GitHub
- CRON jobs y automatización

Testing & Security:
- Software Testing - Postman, JMeter, Cypress, Jira
- Cybersecurity - OWASP ZAP, ISO 27001
- Pruebas manuales y automatizadas

Otros:
- Unity (desarrollo de juegos)
- Tkinter (aplicaciones de escritorio)

IDIOMAS:
- Español: Nativo
- Inglés: Intermedio (A1-B2)

PROYECTOS DESTACADOS:

1. Frutatza E-commerce, antes Frutaza (Nov 2025 - Dic 2025)
   - Plataforma e-commerce full-stack para productos amazónicos
   - Stack: Next.js, React, TailwindCSS, Node.js, Shopify API
   - Features: Integración Shopify Storefront API (headless commerce), scraping automatizado de TikTok con CRON jobs, chatbot con IA que habla sobre laa marca, gateway Mercado Pago, animaciones parallax
   - En producción atendiendo clientes reales
   - URL: https://www.frutatza.com/

2. Panel Plus Solar (Ene 2024 - May 2024)
   - Sitio web corporativo con diseño responsive y SEO
   - Stack: React, TailwindCSS, JavaScript
   - Features: Módulo de simulación de inversión, formularios de contacto, integración redes sociales
   - URL: https://www.panelplussolar.com/
   - Chatbot con IA integrado para atención al cliente
   -Simulador de presupuestos energéticos

3. FlyTours SaaS (Ene 2025 - Jul 2025)
   - Plataforma SaaS para agencias de viajes
   - Rol: Líder de Proyecto
   - Stack: React, Node.js, TypeScript, MySQL
   - Módulos: Búsqueda, selección, cotización, sistema de reservas
   - GitHub: https://github.com/alexpipe31w/Flytours

4. Sistema de Automatización de Pagos Nequi (2025)
   - Sistema que valida recibos de pago en tiempo real vía chatbot
   - Stack: Node.js, Express, MySQL, Python
   - Almacena transacciones diarias para contabilidad empresarial

5. Portfolio Website Personal (2025)
   - Sitio web personal con diseño moderno
   - Stack: React, Vite, TailwindCSS, TypeScript
   - Secciones: About, Resume, Portfolio, Blog, Contact
   - URL: https://alex-rodriguez-portfol.vercel.app/
   -Chatbot con IA para responder preguntas sobre mi experiencia y proyectos

EDUCACIÓN:

Universitaria:
- Ingeniería de Software - Universidad Fundación Escuela Tecnológica Jesús Oviedo Pérez (Cursando actualmente)
- Técnico en Electrónica y Telecomunicaciones - Instituto Politécnico Americano (2023-2024)
- Técnico en Electromecánica - Instituto Politécnico Americano (2023-2024)

Diplomados y Certificaciones:
- Diplomado en Pruebas de Software y Testing Automatizado - UESC (Oct-Dic 2024)
- Diplomado en Programación Python - UESC (Nov-Dic 2024)
- Inglés Intensivo A1-B2 - Compañía KOE (2024-2025)
- Certificado de Inglés Avanzado - Ileusco, Universidad Surcolombiana (2025-Presente)
- Cisco Networking Academy: Introduction to Cybersecurity, Linux Uncharted, Linux Essentials
- UDEMY: RAG agents build apps & GPTs with APIs-MCP Langchain&n8n
- IBM: Generative AI - Prompt Engineering
- Claseflix: JavaScript, SEO, Inglés A1-B2

EXPERIENCIA LABORAL:

Freelance Full-Stack Developer – Frutatza (Nov 2025 - Dic 2025):
- Diseño y desarrollo de plataforma e-commerce completa
- Implementación Next.js con SSR y optimización SEO
- Integración Shopify Storefront API (headless commerce)
- Configuración Mercado Pago para pagos seguros
- Chatbot WhatsApp para atención al cliente y gestión de pedidos

Developer – Panel Plus Solar (Ene 2024 - May 2024):
- Desarrollo sitio web oficial con diseño responsive y SEO
- Implementación CMS, formularios de contacto
- Módulo de simulación de presupuesto de inversión

Project Leader – FlyTours (Ene 2025 - Jul 2025):
- Coordinación desarrollo plataforma SaaS para agencias de viajes
- Definición de requerimientos y asignación de tareas
- Supervisión desarrollo e integración de módulos

EVENTOS Y PARTICIPACIONES:

- Colombia 4.0 (Sep 2025, Bogotá) - Evento tecnología e innovación
- Hackathon Universitario (May 2024) - Soluciones tecnológicas en 48 horas
- Hackathon Universitario (Nov 2024) - Desarrollo de soluciones digitales innovadoras
- Feria Universitaria de Ciencia y Tecnología (Oct 2025, Neiva) - Exhibición proyectos
- Ferias tecnológicas y proyectos electrónicos (2024-2025)

ÁREAS DE ESPECIALIZACIÓN:
- Desarrollo Frontend: Interfaces modernas, responsive y optimizadas
- Desarrollo Backend: APIs escalables, integraciones third-party
- Aplicaciones SaaS Full-Stack
- Sistemas de automatización de pagos
- Ciberseguridad y Testing
- Web scraping y automatización con CRON

INSTRUCCIONES DE RESPUESTA:
- Responde SOLO sobre Alex, sus proyectos, habilidades, experiencia, educación y trayectoria profesional
- Si preguntan sobre política, deportes, otros desarrolladores u otros temas NO relacionados con Alex, responde educadamente: "Soy el asistente personal de Alex Felipe Rodríguez 💻 Estoy aquí para contarte sobre su experiencia como desarrollador, sus proyectos y habilidades. ¿Te gustaría conocer más sobre su trabajo?"
- Sé profesional pero cercano, usa emojis ocasionalmente 💼🚀
- Destaca su experiencia práctica, proyectos en producción y habilidades técnicas
- Si preguntan sobre disponibilidad, menciona que está abierto a proyectos freelance y trabajo remoto
- Proporciona enlaces cuando sean relevantes (portfolio, GitHub, LinkedIn, proyectos)
- Enfatiza su enfoque en código limpio, seguridad y buenas prácticas`;

// ============================================
// RUTA 1: Enviar emails (ya existente)
// ============================================
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await resend.emails.send({
      from: "Mi Portafolio <onboarding@resend.dev>", 
      to: "alexpipe31w@gmail.com",
      subject: `Nuevo mensaje de ${name}`,
      html: `<p><b>De:</b> ${name} (${email})</p><p>${message}</p>`,
    });

    console.log("📧 Email enviado correctamente");
    res.status(200).json({ success: true, msg: "Mensaje enviado ✅" });
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    res.status(500).json({ success: false, msg: "Error al enviar el mensaje ❌" });
  }
});

// ============================================
// RUTA 2: Chatbot con Groq (nueva)
// ============================================
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: "El mensaje es requerido" 
      });
    }

    console.log("💬 Mensaje del chatbot:", message);

    // Construir mensajes para Groq
    const messages = [
      {
        role: "system",
        content: `${PORTFOLIO_CONTEXT}

${PLAIN_TEXT_RULE}`
      },
      ...history.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      })),
      {
        role: "user",
        content: message
      }
    ];

    // Llamar a Groq
    const completion = await groq.chat.completions.create({
      messages: messages,
      // llama-3.3-70b-versatile lo retiró Groq el 16-08-2026; este es su reemplazo recomendado.
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      // gpt-oss razona antes de responder y ese razonamiento sale del mismo max_tokens.
      reasoning_effort: "low",
      max_tokens: 2000,
      top_p: 1,
    });

    const responseText = stripMarkdown(completion.choices[0]?.message?.content || "Error al generar respuesta");

    console.log("✅ Respuesta del chatbot generada");

    res.json({ 
      response: responseText 
    });

  } catch (error) {
    console.error("❌ Error en chatbot:", error);
    res.status(500).json({
      error: "Error al procesar la solicitud",
      response: "Lo siento, hubo un error de conexión. Por favor intenta de nuevo."
    });
  }
});

// ============================================
// Health check
// ============================================
app.get("/", (req, res) => {
  res.json({ 
    status: "Backend funcionando ✅",
    endpoints: [
      "POST /send-email - Enviar correos",
      "POST /api/chat - Chatbot con IA"
    ]
  });
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`📧 Endpoint emails: http://localhost:${PORT}/send-email`);
  console.log(`💬 Endpoint chatbot: http://localhost:${PORT}/api/chat`);
});
