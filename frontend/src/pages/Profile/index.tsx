import { zodResolver } from "@hookform/resolvers/zod";
import { FieldInput } from "../../components/FieldInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { Mail, User, Contact } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { userUpdate } from "../../api/UserService";
import { AxiosError } from "axios";
import { useState } from "react";
import z from "zod";
import { SubmitButton } from "../../components/SubmitButton";

const updateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Name is required"),
  email: z.email("Please enter a valid email"),
});

type updateForm = z.infer<typeof updateFormSchema>;

export const Profile = () => {
  const { user, getToken } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      ...user,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: updateForm) =>
      userUpdate({ userId: user!.id, ...data, token: getToken() }),
    onSuccess: () => alert("Your profile has been updated!"),
    onError: (error) => {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      }
    },
  });

  const onSubmit: SubmitHandler<updateForm> = (data) => {
    mutation.mutate(data);
    reset(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="m-5 flex box-border">
        <div className="min-w-ful rounded-2xl p-4 text-sm leading-loose">
          <h1 className="font-bold text-gray-500 text-2xl">Profile</h1>
          <div className="space-y-6 w-100 mt-5">
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
            <p className="text-sm text-red-500">{error}</p>
            <SubmitButton disabled={mutation.isPending || !isDirty}>
              Update
            </SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
};
