import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { ClearMatchPage } from "./pages/ClearMatch";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { MatchingPage } from "./pages/Matching";
import { Session } from "./pages/Session";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

import { TestPage } from "./pages/Test";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/session"
                element={
                  <ProtectedRoute>
                    <Session />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matching"
                element={
                  <ProtectedRoute>
                    <MatchingPage />
                  </ProtectedRoute>
                }
              />
              {/* For testing only */}
              <Route
                path="/test"
                element={
                  <ProtectedRoute>
                    <TestPage />
                  </ProtectedRoute>
                }
              />
              {/* For testing only */}
              <Route
                path="/cancel-match"
                element={
                  <ProtectedRoute>
                    <ClearMatchPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
