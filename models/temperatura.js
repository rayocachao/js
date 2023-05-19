const mongoose = require('mongoose');//No, borrar son los modelos de temperatura

const temperaturaSchema = new mongoose.Schema({
  temp: {
    type: Number,
    required: true
  },
  hum: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    default: new Date() 
  }
}); 

const Temperatura = mongoose.model('Temperatura', temperaturaSchema);

module.exports = Temperatura;
