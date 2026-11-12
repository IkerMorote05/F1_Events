import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeApiError } from '../utils/errorHandler';

export const LoginPage = () => {
  const { isAdmin, isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && isAdmin) return <Navigate to="/" replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const user = await login(credentials);
      const destination = user.role?.toLowerCase() === 'admin'
        ? location.state?.from?.pathname || '/'
        : '/';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(normalizeApiError(loginError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container auth-page">
      <div className="auth-panel">
        <p className="piloto-eyebrow">F1 Classification</p>
        <h1>Iniciar sesión</h1>
        <p className="auth-description">Accede al panel de administración.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">
            Correo electrónico
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </label>

          <label htmlFor="login-password">
            Contraseña
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </label>

          {error ? <p className="auth-error" role="alert">{error}</p> : null}

          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
