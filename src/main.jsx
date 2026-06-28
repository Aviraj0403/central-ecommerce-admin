import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { store, persistor } from './store/Store';
import { PersistGate } from 'redux-persist/integration/react';
import EB from './pages/PNF/EB.jsx';
// ✅ Import your AuthProvider
import AuthProvider from './context/AuthContext';
import WindowContextProvider from './context/windowContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { toast, ToastContainer } from 'react-toastify'; // Import both toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the Toastify styles

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ✅ Wrap App inside AuthProvider */}
    <EB>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <AuthProvider>
              <WindowContextProvider>
                <App />
                 <ToastContainer position="top-center" autoClose={2000} />
              </WindowContextProvider>
            </AuthProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </EB>
  </StrictMode>
);
