import { Socket } from "phoenix";
import { createContext, useContext, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

type SessionContextValue = {
  socket: Socket;
  sessionId: string;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export const SessionContextProvider = ({
  sessionId,
  children,
}: {
  sessionId: string;
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket>(
    new Socket(WEBSOCKET_URL, {
      params: { userId: user?.id },
    }),
  );
  socketRef.current.connect();
  return (
    <SessionContext.Provider value={{ socket: socketRef.current, sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSessionContext must be used within a SessionContextProvider",
    );
  }
  return context;
}
