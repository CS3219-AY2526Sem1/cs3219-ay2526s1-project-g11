import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CircleCheck, Lock } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link, useParams } from "react-router";
import z from "zod";
import { userUpdate } from "../../../api/UserService";
import { FieldInput } from "../../../components/FieldInput";
import { SubmitButton } from "../../../components/SubmitButton";

const resetPasswordFormSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
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

type resetPasswordForm = z.infer<typeof resetPasswordFormSchema>;

interface ResetPasswordFormProps {
  userId: string;
}

const ResetPasswordForm = ({ userId }: ResetPasswordFormProps) => {
  const { token } = useParams();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: resetPasswordForm) =>
      userUpdate({ userId, password: data.password, token }),
    onSuccess: () => setSuccess(true),
    onError: (error) => {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || error.message);
      }
    },
  });

  const onSubmit: SubmitHandler<resetPasswordForm> = (data) =>
    mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {success ? (
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-row items-center justify-center gap-3 text-green-600">
              <CircleCheck /> Your password has been changed successfully.
            </div>
            <Link
              className="underline text-blue-500"
              to={{
                pathname: "/login",
              }}
            >
              Click here to login
            </Link>
          </div>
        ) : (
          <>
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
            <SubmitButton disabled={mutation.isPending}>
              Update Password
            </SubmitButton>
            <p className="text-center">
              Know your credentials?{" "}
              <Link
                className="underline text-blue-500"
                to={{
                  pathname: "/login",
                }}
              >
                Login
              </Link>
            </p>
          </>
        )}
      </div>
    </form>
  );
};

export default ResetPasswordForm;
