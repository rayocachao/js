const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');

// Conexión a MongoDB Atlas
const uri = 'mongodb+srv://admin:Almi123@cluster0.m970ldu.mongodb.net/test';

// Modelo de esquema JSONDATA para el guardado a la base de datos
const nuevoEsquema = new mongoose.Schema({
  jsonData: String
});


// Crear el modelo a partir del esquema                          //Nombre de la colección en mongodb
const NuevoModelo = mongoose.model('NuevoModelo', nuevoEsquema, 'DatosConversor');

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
    const nuevoDocumento = new NuevoModelo({
      jsonData: JSON.stringify(jsonData) // Guarda el JSON como una cadena de texto en el campo "jsonData"
    });

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