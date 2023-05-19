const express = require('express');
const xml2js = require('xml2js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();

// Configurar EJS como motor de plantillas (Esto lo puedo quitar)
app.set('view engine', 'ejs');

// Ruta para mostrar el formulario de la página
app.get('/', (req, res) => {
  res.render('formulario');
});

// Ruta para que pueda procesar el formulario
app.post('/', upload.single('archivo-xml'), (req, res) => {
  // Lee el archivo XML y lo convierte a JSON
  const parser = new xml2js.Parser();
  parser.parseString(req.file.buffer.toString(), (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Ha ocurrido un error');
    } else {
      res.json(result);
    }
  });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
