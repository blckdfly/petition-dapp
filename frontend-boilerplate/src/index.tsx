import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FuelProvider } from '@fuels/react';
import {
  defaultConnectors,
} from '@fuels/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 
const queryClient = new QueryClient();


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        fuelConfig={{
          connectors: defaultConnectors(),
        }}
      >
        <App />
      </FuelProvider>
    </QueryClientProvider>

Icon ClipboardText

  </React.StrictMode>
);

reportWebVitals();
