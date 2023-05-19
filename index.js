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

app.set('view engine', 'ejs');
const ejs = require('ejs');
app.set('views', path.join(__dirname, 'views')); //app.set('view engine', 'ejs');//

const bodyParser = require('body-parser'); //Analiza solicitudes HTTP entrantes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


//mi barra
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
//REGISTRO
app.post('/registro', async (req, res) => {
  const { nombre, apellido, correoElectronico, nombreUsuario, contrasena } = req.body;

  // Verificar si ya existe un usuario con el mismo nombre de usuario
  const usuarioExistente = await Usuario.findOne({ nombreUsuario });

  if (usuarioExistente) { //Error que da al intentar registrar a un usuario ya existente en la base de datos //mejorar css
    res.locals.error = 'El nombre de usuario ya está en uso';
    res.render('registro', { error: res.locals.error });
    return;
  }

  // Crear un nuevo usuario
  const nuevoUsuario = new Usuario({ nombre, apellido, correoElectronico, nombreUsuario, contrasena });

  try {
    await nuevoUsuario.save();
    res.locals.error = 'Registro exitoso, por favor inicie sesión';
    res.render('login', { error: res.locals.error });
  } catch (err) {
    console.error(err);
    res.redirect('/registro');
  }
});


/////

app.post('/login', async (req, res) => {
  const { nombreUsuario, contrasena } = req.body;
  try {
    const usuario = await Usuario.findOne({ nombreUsuario });

    if (!usuario) {
      res.locals.error = 'Credenciales incorrectas';
      res.render('login', { error: res.locals.error });
      return;
    }

    const contrasenaValida = await usuario.validarContrasena(contrasena);

    if (!contrasenaValida) {
      res.locals.error = 'Credenciales incorrectas';
      res.render('login', { error: res.locals.error });
      return;
    }

    const token = jwt.sign({ nombreUsuario }, secretKey);
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/bienvenida');
  } catch (err) {
    console.error(err);
    res.locals.error = 'Error en el inicio de sesión';
    res.render('login', { error: res.locals.error }); //Mensaje de error
  }
});




//verificar token
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



//Routes //Redirección de la página con los links
app.get('/login', (req, res) => {  
  res.sendFile(path.join(__dirname, 'views', 'login.ejs'));
});

//Se supone que verifica el token
//middleware "verificarAutenticacion" se aplica solo a la ruta /bienvenida. Antes de que se envíe el archivo HTML de bienvenida, se verificará la autenticación del usuario//
app.get('/bienvenida', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'bienvenida.html'));
});



//routes y ver la ruta de los archivos
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registro.ejs'));
});


app.get('/transmision', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'transmision.html'));
})


//arreglar POST sobre la conversión de XML a JSON
app.get('/conversor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'conversor.html'));
})

/
// Jebus me ha escuchado
// Jebus me ha escuchado mira bien el "a href"
app.post('/conversor', upload.single('xmlFile'), async (req, res) => {
  try {
    const xmlFilePath = req.file.path;
    const nombreArchivo = req.body.nombreArchivo; 
    const jsonData = await convertirXMLaJSON(xmlFilePath);
    // Guarda el JSON en la base de datos
    const nuevoDocumento = await guardarJSONenBaseDeDatos(jsonData);
    // Ruta del archivo JSON //Cambiar ruta
    const jsonFilePath = path.join(__dirname, 'Descargas', `${nombreArchivo}.json`);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

    // Después de guardar el archivo JSON exitosamente te da el link de bienvenida dale colorcito
    res.send('Conversión y guardado exitosos. <a href="/bienvenida">Ir a la página de bienvenida</a>');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la conversión o guardado');
  }
});

//temperaturas
//rutas para mostrar la página de temperaturas y procesar la petición para obtener las temperaturas desde la base de datos:
app.get('/api/temperaturas', async (req, res) => {
  try {
    const nuevasTemperaturas = await Temperatura.find().sort({ fecha: -1 }).limit(5); // Obtener las últimas 5 nuevas temperaturas ordenadas por fecha
    const temperaturas = await Temperatura.find().sort({ fecha: -1 }).skip(5).limit(10); // Obtener las últimas 10 temperaturas (excluyendo las nuevas temperaturas) ordenadas por fecha

    //res.render('temperaturas', { temperaturas, nuevasTemperaturas }); // Renderizar la plantilla EJS con los datos de temperatura y humedad actualizados
    res.json(temperaturas);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener las temperaturas');
  }
});


//rutas para mostrar la página de temperaturas y procesar la petición para obtener las temperaturas desde la base de datos:
app.get('/temperaturas', async (req, res) => {
  try {
    const nuevasTemperaturas = await Temperatura.find().sort({ fecha: -1 }).limit(5); // Obtener las últimas 5 nuevas temperaturas ordenadas por fecha
    const temperaturas = await Temperatura.find().sort({ fecha: -1 }).skip(5).limit(10); // Obtener las últimas 10 temperaturas (excluyendo las nuevas temperaturas) ordenadas por fecha

    res.render('temperaturas', { temperaturas, nuevasTemperaturas }); // Renderizar la plantilla EJS con los datos de temperatura y humedad actualizados
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener las temperaturas');
  }
});





app.listen(3000, () => console.log('Servidor en ejecución en el puerto 3000')); 