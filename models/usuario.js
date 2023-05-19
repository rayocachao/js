const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const saltRounds = 10;
const plaintextPassword = 'contraseña123';

const usuarioSchema = new Schema({
  nombre: String,
  apellido: String,
  correoElectronico: String,
  nombreUsuario: String,
  contrasena: String
}, { collection: 'registro.usuarios' });

usuarioSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

usuarioSchema.pre('save', async function(next) {
  const usuario = this;
  if (!usuario.isModified('contrasena') || !usuario.contrasena) { // agregar esta verificación
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // generar un salt aleatorio
    const hash = await bcrypt.hash(usuario.contrasena, salt); // usar el salt para cifrar la contraseña
    usuario.contrasena = hash;
    next();
  } catch (err) {
    return next(err);
  }
});

usuarioSchema.methods.validarContrasena = async function(contrasena) {
  const usuario = this;
  try {
    const resultado = await bcrypt.compare(contrasena, usuario.contrasena);
    return resultado;
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model('Usuario', usuarioSchema);
