const mongoose = require('mongoose');
require('dotenv').config();

const Escuderia = require('../models/escuderia.model');
const Piloto = require('../models/piloto.model');
const Circuito = require('../models/circuito.model');
const Usuario = require('../models/usuarios.model');
const Rol = require('../models/roles.model');
const Image = require('../models/image.model');
const Location = require('../models/location.model');
const Variant = require('../models/variant.model');

const rolesData=[
  {nombre:"Admin", description:"Administra los archivos"}
]

const escuderiasData = [
  { nombre: 'Oracle Red Bull Racing', siglas: 'RBR', pais: 'Austria', motor: 'Red Bull Ford', jefe: 'Christian Horner',  año: 1997, categoria:"F1"},
  { nombre: 'Scuderia Ferrari HP', siglas: "SF", pais: 'Italia', motor: 'Ferrari', jefe: 'Frédéric Vasseur', año:1950, categoria:"F1" },
  { nombre: 'McLaren Mastercard F1 Team', siglas: 'MCL', pais: 'Reino Unido', motor: 'Mercedes', jefe: 'Andrea Stella', año: 1966, categoria:"F1"},
  { nombre: 'Mercedes-AMG PETRONAS Formula One Team', siglas:'AMG', pais: 'Alemania', motor: 'Mercedes', jefe: 'Toto Wolff', año: 1970, categoria:"F1"},
  { nombre: 'Aston Martin Aramaco Formula One Team', siglas:'AM', pais: 'Reino Unido', motor: 'Honda RA626H', jefe:'Adrian Newey', año:2018, categoria:"F1"},
  { nombre: 'Visa Cash App Racing Bulls Formula One Team',siglas: "RB", pais: 'Italia', motor: 'Red Bull Ford', jefe: 'Alan Permane', año: 1985, categoria:"F1"},
  { nombre: 'BWT Alpine Formula One Team', siglas: 'BWT', pais: 'Reino Unido', motor: 'Mercedes', jefe: 'Flavio Briatore', año:1986, categoria:"F1"},
  { nombre: 'TGR Haas F1 Team', siglas:'TGR', pais: 'Estados Unidos', motor: 'Ferrari', jefe: 'Ayao Komatsu', año: 2016, categoria:"F1"},
  { nombre: 'Audi Revolut F1 Team', siglas: "AR", pais: "Alemania", motor: 'Audi', jefe: 'Mattia Binotto', año:2026, categoria:"F1"},
  { nombre: 'Atlassian Williams F1 Team', siglas:'AW', pais: 'Reino Unido', motor:'Mercedes', jefe:'James Volwes', año: 1978, categoria:"F1"},
  { nombre: 'Cadillac Formula 1 Team', siglas:"CF1", pais:'Reino Unido', motor:'Ferrari', jefe:'Marcin Budkowski', año:2026, categoria:"F1"}
];

const circuitosData =[
  {nombre:"Circuit de Montmeló", tipo:"Permanente", longitud: 4.657, categoria:"F1", ultimoGanador:"Oscar Piastri", pais:"España", vueltaRapida:{tiempo: "1:16.330", piloto: "Oscar Piastri", anio: 2025}, desgaste:"Alto"},
  {nombre:"Circuito de Shakir", tipo:"Permanente", longitud: 5.412, categoria:"F1", ultimoGanador:"", pais:"Bahrein", vueltaRapida:{tiempo:"1:31.447", piloto:"Pedro de la Rosa", anio: 2005},desgaste:"Alto" },
  {nombre:"Circuito Albert-Park", tipo:"SemiUrbano", longitud:5.278, categoria:"F1", ultimoGanador:"George Russell", pais:"Australia", vueltaRapida:{tiempo:"1:19.813", piloto:"Charles Leclerc", anio:2024}, desgaste:"Bajo-Moderado"},
  {nombre:"Circuito de Shanghai", tipo:"Permanente", longitud:5.451, catetgoria:"F1", ultimoGanador:"Kimi Antonelli", pais:"China", vueltaRapida:{tiempo:"1:32.238", piloto:"Michael Schumacher", anio:2004}, desgaste:"Alto"},
  {nombre:"Circuito de Suzuka", tipo:"Permanente", longitud:5.807, categoria:"F1", ultimoGanador:"Kimi Antonelli", pais:"Japon", vueltaRapida:{tiempo:"1:30.965", piloto:"Kimi Antonelli", anio: 2025}, desgaste:"Medio-Alto" }
]


const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a la base de datos para sembrado...');
    await Usuario.deleteMany({});
    await Rol.deleteMany({});
    await Image.deleteMany({});
    await Location.deleteMany({});
    await Variant.deleteMany({});
    await Escuderia.deleteMany({});
    await Piloto.deleteMany({});
    await Circuito.deleteMany({});

    const escuderiasCreadas = await Escuderia.insertMany(escuderiasData);

    const redBull = escuderiasCreadas.find((e) => e.nombre === 'Oracle Red Bull Racing')._id;
    const ferrari = escuderiasCreadas.find((e) => e.nombre === 'Scuderia Ferrari HP')._id;
    const mclaren = escuderiasCreadas.find((e) => e.nombre === 'McLaren Mastercard F1 Team')._id;
    const astonMartin = escuderiasCreadas.find((e) => e.nombre === 'Aston Martin Aramaco Formula One Team')._id;
    const mercedes = escuderiasCreadas.find((e) => e.nombre === 'Mercedes-AMG PETRONAS Formula One Team')._id;
    const cadillac = escuderiasCreadas.find((e) => e.nombre === 'Cadillac Formula 1 Team')._id;
    const audi = escuderiasCreadas.find((e) => e.nombre === 'Audi Revolut F1 Team')._id;
    const alpine = escuderiasCreadas.find((e) => e.nombre === 'BWT Alpine Formula One Team')._id;
    const racingBulls = escuderiasCreadas.find((e) => e.nombre === 'Visa Cash App Racing Bulls Formula One Team')._id;
    const williams = escuderiasCreadas.find((e) => e.nombre === 'Atlassian Williams F1 Team')._id;
    const haas = escuderiasCreadas.find((e) => e.nombre === 'TGR Haas F1 Team')._id;

    const pilotosData = [
      { nombre: 'Nico Hulkenberg', numero: 27, nacionalidad: 'Alemana', escuderia: audi, puntos: 13, victorias: 0, podios: 0, fecha_nacimiento: '1987-08-19', categoria:"F1" },
      { nombre: 'Gabriel Bortoleto', numero: 5, nacionalidad: 'Brasileña', escuderia: audi, puntos: 10, victorias: 0, podios: 0, fecha_nacimiento: '2002-05-15', categoria:"F1" },
      { nombre: 'Esteban Ocon', numero: 31, nacionalidad: 'Francesa', escuderia: haas, puntos: 7, victorias: 0, podios: 0, fecha_nacimiento: '1996-09-18' , categoria:"F1"},
      { nombre: 'Oliver Bearman', numero: 87, nacionalidad: 'Británica', escuderia: haas, puntos: 23, victorias: 0, podios: 0, fecha_nacimiento: '2004-04-28', categoria:"F1" },
      { nombre: 'Pierre Gasly', numero: 10, nacionalidad: 'Francesa', escuderia: alpine, puntos: 41, victorias: 0, podios: 0, fecha_nacimiento: '1996-02-24', categoria:"F1" },
      { nombre: 'Franco Colapinto', numero: 43, nacionalidad: 'Argentina', escuderia: alpine, puntos: 27, victorias: 0, podios: 0, fecha_nacimiento: '2003-12-15' , categoria:"F1"},
      { nombre: 'Liam Lawson', numero: 30, nacionalidad: 'Neozelandés', escuderia: racingBulls, puntos: 75, victorias: 0, podios: 0, fecha_nacimiento: '2000-01-01', categoria:"F1" },
      { nombre: 'Arvid Linblad', numero: 41, nacionalidad: 'Británica', escuderia: racingBulls, puntos: 38, victorias: 0, podios: 0, fecha_nacimiento: '2001-01-01', categoria:"F1" },
      { nombre: 'George Russell', numero: 63, nacionalidad: 'Británica', escuderia: mercedes, puntos: 238, victorias: 3, podios: 8, fecha_nacimiento: '1998-02-15' , categoria:"F1"},
      { nombre: 'Kimi Antonelli', numero: 12, nacionalidad: 'Italiana', escuderia: mercedes, puntos: 340, victorias: 8, podios: 14, fecha_nacimiento: '2000-01-01' , categoria:"F1"},
      { nombre: 'Max Verstappen', numero: 3, nacionalidad: 'Neerlandesa', escuderia: redBull, puntos: 221, victorias: 3, podios: 10, fecha_nacimiento: '1997-09-30', categoria:"F1" },
      { nombre: 'Isack Hadjar', numero: 6, nacionalidad: 'Francesa', escuderia: redBull, puntos: 97, victorias: 0, podios: 2, fecha_nacimiento: '2000-01-01', categoria:"F1" },
      { nombre: 'Lando Norris', numero: 1, nacionalidad: 'Británica', escuderia: mclaren, puntos: 201, victorias: 2, podios: 5, fecha_nacimiento: '1999-11-13', categoria:"F1" },
      { nombre: 'Oscar Piastri', numero: 81, nacionalidad: 'Australiana', escuderia: mclaren, puntos: 138, victorias: 0, podios: 2, fecha_nacimiento: '2001-04-26', categoria:"F1"},
      { nombre: 'Lewis Hamilton', numero: 44, nacionalidad: 'Británica', escuderia: ferrari, puntos: 229, victorias: 1, podios: 7, fecha_nacimiento: '1985-01-07' , categoria:"F1"},
      { nombre: 'Charles Leclerc', numero: 16, nacionalidad: 'Monegasca', escuderia: ferrari, puntos: 215, victorias: 1, podios: 6, fecha_nacimiento: '1997-10-28', categoria:"F1" },
      { nombre: 'Carlos Sainz', numero: 55, nacionalidad: 'Española', escuderia: williams, puntos: 7, victorias: 0, podios: 0, fecha_nacimiento: '1994-09-01', categoria:"F1" },
      { nombre: 'Alexander Albon', numero: 23, nacionalidad: 'Tahilandesa/Británica', escuderia: williams, puntos: 5, victorias: 0, podios: 0, fecha_nacimiento: '1995-03-23', categoria:"F1" },
      { nombre: 'Fernando Alonso', numero: 14, nacionalidad: 'Española', escuderia: astonMartin, puntos: 7, victorias: 0, podios: 0, fecha_nacimiento: '1981-07-29', categoria:"F1" },
      { nombre: 'Lance Stroll', numero: 18, nacionalidad: 'Canadiense', escuderia: astonMartin, puntos: 0, victorias: 0, podios: 0, fecha_nacimiento: '1998-06-23', categoria:"F1" },
      { nombre: "Sergio 'Checo' Perez", numero: 11, nacionalidad: 'Mexicana', escuderia: cadillac, puntos: 0, victorias: 0, podios: 0, fecha_nacimiento: '1990-07-26', categoria:"F1" },
      { nombre: 'Valtteri Bottas', numero: 77, nacionalidad: 'Finlandesa', escuderia: cadillac, puntos: 0, victorias: 0, podios: 0, fecha_nacimiento: '1989-08-28', categoria:"F1" }
    ];
    const roles = await Rol.insertMany(rolesData);
    const admin = roles.find((e) => e.nombre ==="Admin");
    const usuariosData=[
      {nombre:"Pepito", apellidos:"Perez", email:"prueba@gmail.com", password:"123456789", roles:admin._id}
    ];
    await Usuario.insertMany(usuariosData);
    const pilotosCreados = await Piloto.insertMany(pilotosData);
    await Circuito.insertMany(circuitosData);

    const locationsData = [
      { pais: 'España', ciudad: 'Barcelona', capital: 'Madrid', slug: 'barcelona-madrid-espana' },
      { pais: 'Italia', ciudad: 'Monza', capital: 'Roma', slug: 'monza-roma-italia' },
      { pais: 'Japón', ciudad: 'Suzuka', capital: 'Tokio', slug: 'suzuka-tokio-japon' },
    ];
    await Location.insertMany(locationsData);

    const variantsData = [
      { sku: 'F1-CAP-RED-BULL', slug: 'f1-cap-red-bull' },
      { sku: 'F1-MODEL-FERRARI', slug: 'f1-model-ferrari' },
      { sku: 'F1-SHIRT-MCLAREN', slug: 'f1-shirt-mclaren' },
    ];
    await Variant.insertMany(variantsData);

    const maxVerstappen = pilotosCreados.find((piloto) => piloto.nombre === 'Max Verstappen');
    const lewisHamilton = pilotosCreados.find((piloto) => piloto.nombre === 'Lewis Hamilton');
    const landoNorris = pilotosCreados.find((piloto) => piloto.nombre === 'Lando Norris');
    const imagesData = [
      {
        entity_type: 'Piloto',
        entity_id: maxVerstappen._id,
        image_url: 'https://example.com/images/max-verstappen.jpg',
        alt_text: 'Max Verstappen',
        position: 0,
        slug: 'max-verstappen-portrait',
      },
      {
        entity_type: 'Piloto',
        entity_id: lewisHamilton._id,
        image_url: 'https://example.com/images/lewis-hamilton.jpg',
        alt_text: 'Lewis Hamilton',
        position: 0,
        slug: 'lewis-hamilton-portrait',
      },
      {
        entity_type: 'Piloto',
        entity_id: landoNorris._id,
        image_url: 'https://example.com/images/lando-norris.jpg',
        alt_text: 'Lando Norris',
        position: 0,
        slug: 'lando-norris-portrait',
      },
    ];
    await Image.insertMany(imagesData);
    console.log('Datos de prueba insertados con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el sembrado:', error);
    process.exit(1);
  }
};

seedDB();