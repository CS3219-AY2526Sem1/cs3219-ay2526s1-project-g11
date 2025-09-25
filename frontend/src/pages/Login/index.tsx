import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router";
import { userLogin } from "../../api/UserService";
import { useMutation } from "@tanstack/react-query";
import { LoginResponse } from "../../types/types";
import { AxiosError } from "axios";

// Tool: Claude (model: Sonnet 4), date: 2025‑09‑21
// Scope: Generated a very basic login screen with no logic
// Author review: I validated correctness, edited for style, and manually added authentication logic
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => userLogin({ email, password }),
    onSuccess: (user: LoginResponse) => {
      login(user);
      navigate("/");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.status === 401) {
          setError("The email or password is not correct!");
        } else {
          setError("An unknown error occurred. Please try again later.");
        }
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="min-h-screen min-w-screen absolute top-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-sm text-red-500">{error}</p>
            <button
              disabled={mutation.isPending}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
            <p className="text-center">
              Don't have an account?{" "}
              <Link
                className="underline text-blue-500"
                to={{
                  pathname: "/signup",
                }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Login;
