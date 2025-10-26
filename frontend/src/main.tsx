import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Header } from "./components/Header";
import {
  ProtectedAdminRoute,
  ProtectedRoute,
} from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { MatchingPage } from "./pages/Matching";
import { Session } from "./pages/Session";
import Signup from "./pages/Signup";
import Users from "./pages/Users";

const queryClient = new QueryClient();

import { TestPage } from "./pages/Test";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Theme>
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
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedAdminRoute>
                      <Users />
                    </ProtectedAdminRoute>
                  }
                />
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
              </Routes>
            </Theme>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
