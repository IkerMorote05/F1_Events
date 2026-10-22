const pilotoRepository = require('../repositories/piloto.repository');

class ClasificacionService {
  async obtenerClasificacion() {
    const pilotos = await pilotoRepository.findClasificacion();
    
    return pilotos.map((piloto, index) => ({
      posicion: index + 1,
      id: piloto._id,
      nombre: piloto.nombre,
      numero: piloto.numero,
      nacionalidad: piloto.nacionalidad,
      escuderia: piloto.escuderia ? piloto.escuderia.nombre : 'Sin Escuderia',
      puntos: piloto.puntos,
      victorias: piloto.victorias,
      podios: piloto.podios
    }));
  }
}

module.exports = new ClasificacionService();