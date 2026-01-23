import React, { useEffect } from 'react';
import Navbar from './Utility/Navbar';
import { authService } from './services/authService';

import { CartProvider } from './Utility/CartContext';

function App() {

  useEffect(() => {
    // Validate session on app initialization
    const validate = async () => {
      if (authService.isAuthenticated()) {
        console.log('App: Validating existing session...');
        await authService.validateSession();
      }
    };
    validate();
  }, []);

  return (
    <div className="font-sans">

      <CartProvider><Navbar /></CartProvider>
    </div>
  );
}

export default App;
