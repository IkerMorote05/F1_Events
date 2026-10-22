const getId = (value) => {
  const id = value && typeof value === 'object' ? value._id : value;
  return id == null ? null : String(id);
};

export const calculateEscuderiaPoints = (pilotos) => {
  const pointsByEscuderia = new Map();

  pilotos.forEach((piloto) => {
    if (piloto.deletedAt || piloto.isActive === false) return;

    const escuderiaId = getId(piloto.escuderia);
    if (!escuderiaId) return;

    const pointsValue = Number(piloto.puntos);
    const puntos = Number.isFinite(pointsValue) ? pointsValue : 0;
    pointsByEscuderia.set(
      escuderiaId,
      (pointsByEscuderia.get(escuderiaId) || 0) + puntos
    );
  });

  return pointsByEscuderia;
};
