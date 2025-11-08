import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import './index.css';
import App from './App.jsx';
import WorkbenchErrorBoundary from './components/WorkbenchErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Theme appearance="dark" grayColor="slate" accentColor="indigo" radius="large" scaling="95%">
      <WorkbenchErrorBoundary key={0}>
        <App />
      </WorkbenchErrorBoundary>
    </Theme>
  </StrictMode>
);
