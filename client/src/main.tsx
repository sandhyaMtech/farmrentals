import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import EquipmentList from "./pages/EquipmentList"; // ✅ this line is new
import "./index.css";

// Add error logging
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

console.log("Initializing application...");

try {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    console.log("Root element found, rendering app...");
    createRoot(rootElement).render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/equipment" element={<EquipmentList />} />
        </Routes>
      </BrowserRouter>
    );
    console.log("App rendered successfully");
  } else {
    console.error("Root element not found in DOM");
  }
} catch (error) {
  console.error("Failed to render application:", error);
}

