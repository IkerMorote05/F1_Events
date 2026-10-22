import React from 'react';
import { Navbar } from './components/Navbar';
import { F1DataProvider } from './context/F1DataContext';
import { AppRouter } from './routes/AppRouter';

export function App() {
  return (
    <F1DataProvider>
      <div className="f1-app">
        <Navbar />
        <main>
          <AppRouter />
        </main>
      </div>
    </F1DataProvider>
  );
}

export default App;