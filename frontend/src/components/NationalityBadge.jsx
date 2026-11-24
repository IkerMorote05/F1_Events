import React from 'react';
import { getNationalityDisplay } from '../utils/nationality';

export const NationalityBadge = ({ nationality, fallback = 'Sin asignar' }) => {
  const display = getNationalityDisplay(nationality);

  if (!display.length) {
    return <>{nationality || fallback}</>;
  }

  return (
    <span title={nationality}>
      {display.map(({ flag, code }, index) => (
        <React.Fragment key={`${flag}-${code}`}>
          {index > 0 && ' / '}
          <span className={`fi fi-${flag}`} aria-hidden="true" /> {code}
        </React.Fragment>
      ))}
    </span>
  );
};
