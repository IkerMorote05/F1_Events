const TOKEN_KEY = 'f1-auth-token';
const USER_KEY = 'f1-auth-user';

export const AUTH_EXPIRED_EVENT = 'f1:auth-expired';

export const readAuthSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    return user && typeof user === 'object' ? { token, user } : null;
  } catch {
    clearAuthSession();
    return null;
  }
};

export const saveAuthSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
