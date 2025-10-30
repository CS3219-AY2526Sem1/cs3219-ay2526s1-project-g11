import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { verifyToken } from "../../api/UserService";
import type { User } from "../../types/types";
import SendResetLinkForm from "./Components/ResetLinkForm";
import ResetPasswordForm from "./Components/ResetPasswordForm";

const ForgotPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();

  const { data, isPending, isEnabled } = useQuery({
    queryKey: ["verifyToken", token],
    queryFn: () => verifyToken(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (!data && !isPending) {
      navigate("/forgot-password");
    }
    if (data) {
      setUser(data.data);
    }
  }, [data, navigate, isPending]);

  let content: React.ReactNode;
  if (isPending && isEnabled) {
    content = <div className="text-center">Loading... </div>;
  } else {
    content = user ? (
      <ResetPasswordForm userId={user.id} />
    ) : (
      <SendResetLinkForm />
    );
  }

  return (
    <div className="min-h-screen min-w-screen absolute top-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-600">Please enter your email address</p>
        </div>
        {content}
      </div>
    </div>
  );
};

export default ForgotPassword;
