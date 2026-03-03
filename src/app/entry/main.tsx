import React from "react";
import ReactDOM from "react-dom/client";
import "@/app/styles/tailwind.css";
import "@/app/styles/globals.css";
import { AppProviders } from "@/app/providers/app-providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>,
);
