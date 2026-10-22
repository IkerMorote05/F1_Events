const NATIONALITIES = {
  alemana: { flag: 'de', code: 'GER' },
  argentina: { flag: 'ar', code: 'ARG' },
  australiana: { flag: 'au', code: 'AUS' },
  brasileña: { flag: 'br', code: 'BRA' },
  británica: { flag: 'gb', code: 'GBR' },
  canadiense: { flag: 'ca', code: 'CAN' },
  española: { flag: 'es', code: 'ESP' },
  finlandesa: { flag: 'fi', code: 'FIN' },
  francesa: { flag: 'fr', code: 'FRA' },
  italiana: { flag: 'it', code: 'ITA' },
  mexicana: { flag: 'mx', code: 'MEX' },
  monegasca: { flag: 'mc', code: 'MON' },
  neerlandesa: { flag: 'nl', code: 'NED' },
  neozelandés: { flag: 'nz', code: 'NZL' },
  tailandesa: { flag: 'th', code: 'THA' },
  tahilandesa: { flag: 'th', code: 'THA' },
};

export const getNationalityDisplay = (nationality = '') =>
  nationality
    .split(/[/,]/)
    .map((country) => NATIONALITIES[country.trim().toLocaleLowerCase()])
    .filter(Boolean);
