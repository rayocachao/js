const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');

// Conexión a MongoDB Atlas
const uri = 'mongodb+srv://admin:Almi123@cluster0.m970ldu.mongodb.net/test';

// Definir el esquema del modelo para la nueva colección
const nuevoEsquema = new mongoose.Schema({
  // Definir próximamente el esquema para guardarlos en mi base de datos
  campo1: String,
  campo2: Number,
  // ...
});

// Crear el modelo a partir del esquema
const NuevoModelo = mongoose.model('NuevoModelo', nuevoEsquema, 'nuevaColeccion');

async function convertirXMLaJSON(xmlFilePath) {
  try {
    const xmlData = await fs.promises.readFile(xmlFilePath, 'utf-8');

    console.log('Contenido del archivo XML:', xmlData); // Agrega este log para verificar el contenido leído

    const jsonData = await parseStringPromise(xmlData);

    console.log('Conversión XML a JSON exitosa');

    return jsonData;
  } catch (error) {
    console.error('Error en la conversión de XML a JSON:', error);
    throw error;
  }
}


async function guardarJSONenBaseDeDatos(jsonData) {
  try {
    // Crear una nueva instancia del modelo NuevoModelo y asignar los datos JSON
    const nuevoDocumento = new NuevoModelo(jsonData);

    // Guardar la nueva instancia en la base de datos
    await nuevoDocumento.save();

    console.log('JSON guardado exitosamente en la base de datos');

    return nuevoDocumento;
  } catch (error) {
    console.error('Error al guardar JSON en la base de datos:', error);
    throw error;
  }
}

async function descargarJSON(jsonData) {
  try {
    const jsonFilePath = path.join(__dirname, 'archivo.json'); // Ruta donde se guardará el archivo JSON

    // Convertir el objeto JSON a una cadena de texto
    const jsonString = JSON.stringify(jsonData, null, 2);

    // Guardar la cadena de texto en un archivo
    fs.writeFileSync(jsonFilePath, jsonString, 'utf-8');

    console.log('Archivo JSON guardado exitosamente:', jsonFilePath);

    return jsonFilePath;
  } catch (error) {
    console.error('Error al descargar el archivo JSON:', error);
    throw error;
  }
}

module.exports = {
  convertirXMLaJSON,
  guardarJSONenBaseDeDatos,
  descargarJSON
};