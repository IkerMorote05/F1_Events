import React from 'react';
import { Navbar } from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { F1DataProvider } from './context/F1DataContext';
import { AppRouter } from './routes/AppRouter';

function AppShell() {
  const { isAdmin } = useAuth();

  return (
    <div className={`f1-app${isAdmin ? ' is-admin' : ''}`}>
      <Navbar />
      <main>
        <AppRouter />
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <F1DataProvider>
        <AppShell />
      </F1DataProvider>
    </AuthProvider>
  );
}

export default App;
