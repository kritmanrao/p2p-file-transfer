import React, { useContext, useReducer, useRef } from "react";
import { io, Socket } from "socket.io-client";

const initialState: { status: string; theme: string; mode: string } = {
  // loading, error, ready, active, finished
  status: "loading",
  // dark or light
  theme: "dark",
  // none , sending ,receiving
  mode: "none",
};
type SocketContextType = {
  socket: Socket;
  status: string;
  theme: string;
  mode: string;
  dispatch: React.Dispatch<{ type: string; payload: string }>;
};

function reducer(
  state: { status: string; theme: string; mode: string },
  action: { type: string; payload: string },
) {
  switch (action.type) {
    case "setStatus":
      return { ...state, status: action.payload };
    case "setTheme":
      return { ...state, theme: action.payload };
    case "setMode":
      return { ...state, mode: action.payload };

    default:
      throw new Error("Unknown Action");
  }
}

const SocketContext = React.createContext<SocketContextType | null>(null);

function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [{ status, mode, theme }, dispatch] = useReducer(reducer, initialState);

  if (!socketRef.current) {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"], // faster, avoids long polling delays
    });
  }

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        dispatch,
        status,
        mode,
        theme,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

function useSocket() {
  const context = useContext(SocketContext);

  if (context === null) {
    throw new Error("useSocket must be used within SocketProvider");
  }

  return context;
}

export { SocketProvider, SocketContext, useSocket };
