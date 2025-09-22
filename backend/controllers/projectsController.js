// controllers/projectsController.js

// Datos de prueba (simulando DB)
const projects = [
    { id: "1", name: "Portafolio Web", description: "Mi página personal", link: "https://example.com" },
    { id: "2", name: "E-commerce", description: "Tienda online en React", link: "https://example.com/shop" },
];

// Controlador para obtener proyectos
const getProjects = (req, res) => {
    res.json(projects);
};

module.exports = { getProjects };
