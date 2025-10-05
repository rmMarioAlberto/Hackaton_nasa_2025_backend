const mongoose = require('mongoose');

// Se define un esquema para la colección de exoplanetas.
// No es necesario incluir todos los campos, solo los que usarás en las consultas,
// a menos que necesites validaciones estrictas.
const exoplanetSchema = new mongoose.Schema({
    pl_name: String,
    hostname: String,
    discoverymethod: String,
    disc_year: Number,
    pl_orbper: Number,
    pl_rade: Number,
    pl_masse: Number,
    sy_dist: Number,
    // Puedes agregar más campos aquí si los necesitas para futuras consultas
}, {
    // 'strict: false' permite que Mongoose maneje documentos que tienen campos no definidos en el esquema.
    // Esto es útil ya que tu colección tiene una gran cantidad de campos.
    strict: false,
    // Se especifica el nombre exacto de la colección en MongoDB.
    collection: 'exoplanets' // Asegúrate de que este sea el nombre correcto de tu colección.
});

// Se crea el modelo a partir del esquema. Mongoose buscará la colección en plural ('exoplanets').
module.exports = mongoose.model('Exoplanet', exoplanetSchema);
