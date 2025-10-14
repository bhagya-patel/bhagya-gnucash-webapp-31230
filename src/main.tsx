import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme
const theme = localStorage.getItem('theme') || 'dark';
document.documentElement.classList.add(theme);

createRoot(document.getElementById("root")!).render(<App />);
