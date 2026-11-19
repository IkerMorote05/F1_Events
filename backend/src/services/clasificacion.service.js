const pilotoRepository = require('../repositories/piloto.repository');
const escuderiaRepository = require('../repositories/escuderia.repository');

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

  async obtenerClasificacionPublica() {
    const [pilotos, escuderias] = await Promise.all([
      pilotoRepository.findClasificacion(),
      escuderiaRepository.findAll()
    ]);

    return {
      pilotos: pilotos.map((piloto) => ({
        _id: piloto._id,
        nombre: piloto.nombre,
        numero: piloto.numero,
        nacionalidad: piloto.nacionalidad,
        escuderia: piloto.escuderia
          ? { _id: piloto.escuderia._id, nombre: piloto.escuderia.nombre }
          : null,
        estado: piloto.estado,
        puntos: piloto.puntos,
        isActive: piloto.isActive,
        deletedAt: piloto.deletedAt
      })),
      escuderias: escuderias.map((escuderia) => ({
        _id: escuderia._id,
        nombre: escuderia.nombre,
        pais: escuderia.pais,
        motor: escuderia.motor,
        jefe: escuderia.jefe,
        isActive: escuderia.isActive,
        deletedAt: escuderia.deletedAt
      }))
    };
  }
}

module.exports = new ClasificacionService();