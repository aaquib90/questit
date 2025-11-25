import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@lottiefiles/dotlottie-wc';
import App from './App.jsx';
import { ToastProvider } from '@/components/ui/toast-provider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
