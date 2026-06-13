// Configuración de la base de datos

const mongoose = require('mongoose');

// Función para conectar a la base de datos
const connectDB = async () => { 
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("Conectado con éxito");
        console.log("Base de datos: " + process.env.DB_NAME);
    } catch (error) {
        console.log("Fallo en la conexión con la base de datos")
    }
}

exports.connectDB = connectDB;