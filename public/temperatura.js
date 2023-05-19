


















/*
const mongoose = require('mongoose');

const temperaturaSchema = new mongoose.Schema({
  temp: Number,
  hum: Number
}, {
  timestamps: true
});

const Temperatura = mongoose.model('Temperatura', temperaturaSchema);

async function obtenerTemperaturas() {
  try {
    const temperaturas = await Temperatura.find().sort({ createdAt: -1 });
    return {
      data: temperaturas.map(temp => ({
        fecha: temp.createdAt.toISOString(),
        temperatura: temp.temp,
        humedad: temp.hum
      }))
    };
  } catch (error) {
    console.error('Error al obtener las temperaturas:', error);
    return {
      error: 'Error al obtener las temperaturas'
    };
  }
}

module.exports = obtenerTemperaturas; */