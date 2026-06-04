import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force unregister all old service workers and clear cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Unregistered old Service Worker');
    }
  });

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
        console.log('Deleted cache:', cacheName);
      });
    });
  }

  // Register new Service Worker with cache busting
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/controle-financeiro-pwa/sw.js?v=' + Date.now())
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
