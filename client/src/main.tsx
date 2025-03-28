import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error logging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add unhandled promise rejection logging
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Log that we're starting to render
console.log('Initializing application...');

try {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    console.log('Root element found, rendering app...');
    createRoot(rootElement).render(<App />);
    console.log('App rendered successfully');
  } else {
    console.error('Root element not found in DOM');
  }
} catch (error) {
  console.error('Failed to render application:', error);
}
