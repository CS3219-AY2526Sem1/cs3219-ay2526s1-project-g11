import axios, { type AxiosResponse } from "axios";
import type { GetQuestionByIdResponse } from "../types/types";

const QUESTION_API_BASE_URL = import.meta.env.VITE_QUESTION_API_BASE_URL;

const apiClient = axios.create({
  baseURL: QUESTION_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const questionServiceAPIRequest = async <T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: unknown,
  headers?: Record<string, string>,
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient({
    method,
    url,
    data,
    headers,
  });

  return response.data;
};

export const getQuestionById = async (
  id: string,
): Promise<GetQuestionByIdResponse> => {
  const response = await questionServiceAPIRequest<GetQuestionByIdResponse>(
    `/questions/${id}`,
    "GET",
  );
  return response;
};

// bypass CORS in dev for testing
// export const getQuestionById = async (
//   id: string,
// ): Promise<GetQuestionByIdResponse> => {
//   const response = await axios.get(`/questions/${id}`);
//   return response.data;
// };
