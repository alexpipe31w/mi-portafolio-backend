const express = require("express");
const router = express.Router();

// Importar controlador
const { getProjects } = require("../controllers/projectsController");

// Ruta para obtener proyectos
router.get("/", getProjects);

module.exports = router;
