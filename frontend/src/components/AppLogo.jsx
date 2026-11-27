import React from 'react';

export const AppLogo = ({ size = 32, showText = true, kicker = 'FIA Formula One', title = 'Apex F1' }) => (
  <span className="f1-logo-lockup">
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className="f1-logo-mark"
    >
      <rect width="36" height="36" rx="9" fill="#15151e" />
      <rect x="0.75" y="0.75" width="34.5" height="34.5" rx="8.25" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.5" />
      <path d="M7 24.5L13.5 11.5H29L26.2 16.5H16.6L14.9 19.8H23.5L20.9 24.5H7Z" fill="#e10600" />
      <path d="M24.2 19.8H28.5L26 24.5H21.7L24.2 19.8Z" fill="#ffffff" />
    </svg>
    {showText ? (
      <span className="f1-logo-text">
        {kicker ? <span className="f1-brand-kicker">{kicker}</span> : null}
        <span className="f1-brand-title">{title}</span>
      </span>
    ) : null}
  </span>
);
