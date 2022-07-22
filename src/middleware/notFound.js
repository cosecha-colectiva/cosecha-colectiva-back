const notFound = (req, res) => {
    res.status(404).json({code: 404, message: "Ruta no Existe"})
}

module.exports = notFound;