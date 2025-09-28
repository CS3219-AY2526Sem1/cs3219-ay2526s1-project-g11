import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Contact, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import z from "zod";
import { userLogin, userSignup } from "../../api/UserService";
import { FieldInput } from "../../components/FieldInput";
import { SubmitButton } from "../../components/SubmitButton";
import { useAuth } from "../../context/AuthContext";
import type { LoginResponse } from "../../types/types";

const signupFormSchema = z
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

type signupForm = z.infer<typeof signupFormSchema>;

const Signup = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(signupFormSchema),
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

	const onSubmit: SubmitHandler<signupForm> = (data) => mutation.mutate(data);

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
							icon={<User />}
							{...register("name")}
							type="text"
							placeholder="Name"
							required
						/>
						<FieldInput
							icon={<Contact />}
							type="text"
							placeholder="Username"
							{...register("username")}
							required
						/>
						<FieldInput
							icon={<Mail />}
							type="email"
							placeholder="Email"
							{...register("email")}
							required
						/>
						<FieldInput
							icon={<Lock />}
							type="password"
							placeholder="Password"
							{...register("password")}
							required
							password
						/>
						<FieldInput
							icon={<Lock />}
							type="password"
							placeholder="Confirm Password"
							{...register("confirmPassword")}
							required
							password
						/>
						<p className="text-sm text-red-500">
							{error || errors.password?.message}
						</p>
						<SubmitButton disabled={mutation.isPending}>Sign Up</SubmitButton>
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
