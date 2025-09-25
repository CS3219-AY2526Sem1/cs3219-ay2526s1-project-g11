import { useState } from "react";
import { Mail, Lock, User, Contact } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { userLogin, userSignup } from "../../api/UserService";
import { useMutation } from "@tanstack/react-query";
import { LoginResponse, SignupResponse } from "../../types/types";
import { AxiosError } from "axios";
import { FieldInput } from "../../components/FieldInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useAuth } from "../../context/AuthContext";

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Name is required"),
    email: z.email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match!",
        path: ["password"],
      });
    }
  });

type signupForm = z.infer<typeof signupSchema>;

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: () =>
      userLogin({ email: getValues("email"), password: getValues("password") }),
    onSuccess: (user: LoginResponse) => {
      login(user);
      navigate("/");
    },
    onError: () => {
      navigate("/login");
    },
  });

  const mutation = useMutation({
    mutationFn: (data: signupForm) => userSignup(data),
    onSuccess: () => loginMutation.mutate(),
    onError: (error) => {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      }
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof signupSchema>> = (data) =>
    mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to PeerPrep!
            </h2>
            <p className="text-gray-600">Please fill in your details below</p>
          </div>

          <div className="space-y-6">
            <FieldInput
              icon={
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              }
              {...register("name")}
              type="text"
              placeholder="Name"
              required
            />
            <FieldInput
              icon={
                <Contact className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              }
              type="text"
              placeholder="Username"
              {...register("username")}
              required
            />
            <FieldInput
              icon={
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              }
              type="email"
              placeholder="Email"
              {...register("email")}
              required
            />
            <FieldInput
              icon={
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              }
              type="password"
              placeholder="Password"
              {...register("password")}
              required
              password
            />
            <FieldInput
              icon={
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              }
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              required
              password
            />
            <p className="text-sm text-red-500">
              {error || errors.password?.message}
            </p>
            <button
              disabled={mutation.isPending}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </button>
            <p className="text-center">
              Already have an accoint?{" "}
              <Link
                className="underline text-blue-500"
                to={{
                  pathname: "/login",
                }}
              >
                Login!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Signup;
