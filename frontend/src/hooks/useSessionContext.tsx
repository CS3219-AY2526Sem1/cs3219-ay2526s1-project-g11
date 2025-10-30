import { Socket } from "phoenix";
import type React from "react";
import { createContext, type SetStateAction, useContext, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import type { GetQuestionByIdResponse } from "../types/types";

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

type SessionContextValue = {
  socket: Socket;
  sessionId: string;
  question: GetQuestionByIdResponse | undefined;
  isSessionEnded: boolean;
  setIsSessionEnded: React.Dispatch<SetStateAction<boolean>>;
  partnerId: string;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export const SessionContextProvider = ({
  sessionId,
  question,
  children,
  isSessionEnded,
  setIsSessionEnded,
  partnerId,
}: {
  sessionId: string;
  question: GetQuestionByIdResponse | undefined;
  children: React.ReactNode;
  isSessionEnded: boolean;
  setIsSessionEnded: React.Dispatch<SetStateAction<boolean>>;
  partnerId: string;
}) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket>(
    new Socket(WEBSOCKET_URL, {
      params: { userId: user?.id },
    }),
  );
  socketRef.current.connect();
  return (
    <SessionContext.Provider
      value={{
        socket: socketRef.current,
        sessionId,
        question,
        isSessionEnded,
        setIsSessionEnded,
        partnerId,
      }}
    >
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
