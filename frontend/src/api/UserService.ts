import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { LoginResponse, VerifyTokenResponse } from "../types/types";

const USER_API_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL;

const apiClient = axios.create({
	baseURL: USER_API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

const userServiceApiRequest = async <T>(
	url: string,
	method: "GET" | "POST" | "PUT" | "DELETE",
	data?: any,
	headers?: any,
): Promise<T> => {
	const response: AxiosResponse<T> = await apiClient({
		method,
		url,
		data,
		headers,
	});

	return response.data;
};

export const verifyToken = async ({
	token,
}: {
	token: string;
}): Promise<VerifyTokenResponse> => {
	return await userServiceApiRequest<VerifyTokenResponse>(
		"/auth/verify-token",
		"GET",
		{},
		{
			Authorization: `Bearer ${token}`,
		},
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
