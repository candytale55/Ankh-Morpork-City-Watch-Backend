// Configuración de la base de datos

const mongoose = require('mongoose');

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("Conectado con éxito");
    } catch (error) {
        console.error("Fallo en la conexión con la base de datos", error.message)
    }
}

exports.connectDB = connectDB;