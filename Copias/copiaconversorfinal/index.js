const mongoose = require('mongoose'); //mongoosewe
const bcrypt = require('bcrypt'); //hashing de contraseña (inmune a ataques de diccionario)
const Usuario = require('./models/usuario'); // se importa el modelo de usuario --> Crea o busca usuarios
const Temperatura = require('./models/temperatura'); // importamos el modelo de Temperatura
const conversor = require('./public/conversor');
const secretKey = 'pinga64';
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const port = 3000;
const path = require('path');
const fs = require('fs');
const readlineSync = require('readline-sync');
const { convertirXMLaJSON, guardarJSONenBaseDeDatos } = require('./public/conversor');


const express = require('express');

const app = express();
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public'))); //CSS en la carpeta "public"

const ejs = require('ejs');
app.set('view engine', 'ejs');

const bodyParser = require('body-parser'); //Analiza solicitudes HTTP entrantes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


//routes
app.get('/', (req, res) => {  
  res.sendFile(path.join(__dirname, 'public', 'html','logueo.html'));
});


async function conectar() {
  try {
    await mongoose.connect('mongodb+srv://admin:Almi123@cluster0.m970ldu.mongodb.net/?retryWrites=true&', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conexión exitosa a la base de datos');
     //Eliminar ejemplo de Juan Pérez, Juan Pérez es vida
    const nuevoUsuario = new Usuario({
      nombre: 'Juan',
      apellido: 'Pérez',
      correoElectronico: 'juan.perez@example.com',
      nombreUsuario: 'juanperez',
      contrasena: await bcrypt.hash('contraseña123', 10)
    });
    
    await nuevoUsuario.save();
    console.log('Usuario guardado exitosamente:', nuevoUsuario);
    
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
}

conectar();

app.post('/registro', async (req, res) => {
  const { nombre, apellido, correoElectronico, nombreUsuario, contrasena } = req.body;
  const nuevoUsuario = new Usuario({ nombre, apellido, correoElectronico, nombreUsuario, contrasena }); // se crea un nuevo usuario usando el modelo de usuario importado
  try {
    await nuevoUsuario.save();
    res.send('Registro exitoso');
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error en el registro: ${err.message}`); // Modifica el mensaje de error para incluir el error real
  }
});

app.post('/login', async (req, res) => {
  const { nombreUsuario, contrasena } = req.body;
  try {
    const usuario = await Usuario.findOne({ nombreUsuario });

    if (!usuario) {
      res.status(401).send('Credenciales incorrectas');
      return;
    }

    const contrasenaValida = await usuario.validarContrasena(contrasena);

    if (!contrasenaValida) {
      res.status(401).send('Credenciales incorrectas');
      return;
    }

    const token = jwt.sign({ nombreUsuario }, secretKey);
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/bienvenida');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el inicio de sesión');
  }
});




//Routes //Redirección de la página con los links
app.get('/bienvenida', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'bienvenida.html'));
});

function verificarAutenticacion(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).send('No se proporcionó ningún token');
    return;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    // El token es válido, puedes permitir el acceso al recurso protegido
    next();
  } catch (err) {
    console.error(err);
    res.status(403).send('Token inválido');
  }
}



//routes y ver la ruta de los archivos
app.get('/transmision', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'transmision.html'));
})

//arreglar POST sobre la conversión de XML a JSON
app.get('/conversor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'conversor.html'));
})

// Agrega esta ruta después de la definición de la ruta "/conversor"
// Agrega esta ruta después de la definición de la ruta "/conversor"
// Agrega esta ruta después de la definición de la ruta "/conversor"
app.post('/conversor', upload.single('xmlFile'), async (req, res) => {
  try {
    const xmlFilePath = req.file.path;

    // Convertir XML a JSON
    const jsonData = await convertirXMLaJSON(xmlFilePath);

    // Guardar JSON en la base de datos
    const nuevoDocumento = await guardarJSONenBaseDeDatos(jsonData);

    // Solicitar al usuario el nombre del archivo JSON
    const nombreArchivo = readlineSync.question('Ingresa el nombre del archivo JSON: ');

    // Crear la ruta del archivo JSON
    const jsonFilePath = path.join(__dirname, 'public', `${nombreArchivo}.json`);

    // Guardar el archivo JSON en el sistema de archivos
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

    res.send('Conversión y guardado exitosos');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la conversión o guardado');
  }
});



//rutas para mostrar la página de temperaturas y procesar la petición para obtener las temperaturas desde la base de datos:
app.get('/temperaturas', async (req, res) => {
  try {
    const temperaturas = await Temperatura.find().sort({ fecha: -1 }).limit(10); // Obtener las últimas 10 temperaturas ordenadas por fecha
    const nuevasTemperaturas = await Temperatura.find().sort({ fecha: -1 }).skip(10); // Obtener las nuevas temperaturas a partir de la posición 10

    res.render('temperaturas', { temperaturas, nuevasTemperaturas }); // Renderizar la plantilla EJS con los datos de temperatura y humedad separados
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener las temperaturas');
  }
});


app.listen(3000, () => console.log('Servidor en ejecución en el puerto 3000')); 