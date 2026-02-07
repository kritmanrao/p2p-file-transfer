import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SocketProvider } from "./service/socket.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <App />

      <footer className="relative h-16 border-t border-white/10 bg-[#070a14]">
        <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-1 px-6 text-xs text-white/60 sm:flex-row sm:justify-between sm:gap-0">
          <span>
            Designed & built by{" "}
            <span className="font-semibold text-white">Kritman Rao</span>
          </span>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/kritmanrao/"
              className="hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/kritmanrao/"
              className="hover:text-white"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </SocketProvider>
  </StrictMode>,
);
