import axios, { type AxiosResponse } from "axios";
import type {
  LoginResponse,
  ResetLinkResponse,
  SignupResponse,
  VerifyTokenResponse,
} from "../types/types";

const apiClient = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

const userServiceApiRequest = async <T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: unknown,
  headers?: Record<string, string>,
): Promise<T> => {
  const token = localStorage.getItem("authToken");
  const response: AxiosResponse<T> = await apiClient({
    method,
    url,
    data,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  });

  return response.data;
};

export const verifyToken = async (
  token?: string,
): Promise<VerifyTokenResponse> => {
  return await userServiceApiRequest<VerifyTokenResponse>(
    "/auth/verify-token",
    "GET",
    {},
    ...[
      token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    ],
  );
};

export const userLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return await userServiceApiRequest<LoginResponse>("/auth/login", "POST", {
    email,
    password,
  });
};

export const userSignup = async ({
  name,
  username,
  email,
  password,
}: {
  name: string;
  username: string;
  email: string;
  password: string;
}) => {
  return await userServiceApiRequest<SignupResponse>("/users", "POST", {
    name,
    username,
    email,
    password,
  });
};

export const userUpdate = async ({
  userId,
  name,
  username,
  email,
  password,
  token,
}: {
  userId: string;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  token?: string;
}) => {
  return await userServiceApiRequest<SignupResponse>(
    `/users/${userId}`,
    "PATCH",
    {
      name,
      username,
      email,
      password,
    },
    {
      Authorization: `Bearer ${token}`,
    },
  );
};

export const userSendResetLink = async ({ email }: { email: string }) => {
  return await userServiceApiRequest<ResetLinkResponse>(
    `/auth/forgot-password`,
    "POST",
    {
      email,
    },
  );
};
