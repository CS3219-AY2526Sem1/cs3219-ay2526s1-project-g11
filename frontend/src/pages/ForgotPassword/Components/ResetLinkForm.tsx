import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CircleCheck, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { userSendResetLink } from "../../../api/UserService";
import { FieldInput } from "../../../components/FieldInput";
import { SubmitButton } from "../../../components/SubmitButton";

const SendResetLinkForm = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => userSendResetLink({ email }),
    onSuccess: () => setSuccess(true),
    onError: (error) => {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || error.message);
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
      <div className="space-y-6">
        {success ? (
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-row items-center justify-center gap-3 text-green-600">
              <CircleCheck /> Reset link sent to your inbox.
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
              icon={
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              }
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-sm text-red-500">{error}</p>
            <SubmitButton disabled={mutation.isPending}>
              Send reset link
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

export default SendResetLinkForm;
