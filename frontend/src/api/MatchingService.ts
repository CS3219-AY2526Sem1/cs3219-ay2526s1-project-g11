import axios, { type AxiosResponse } from "axios";
import type {
  GetMatchStatusResponse,
  RequestMatchPayload,
  RequestMatchResponse,
} from "../types/types";

const MATCHING_API_BASE_URL = import.meta.env.VITE_MATCHING_API_BASE_URL;

const apiClient = axios.create({
  baseURL: MATCHING_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const matchingServiceApiRequest = async <T>(
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

export const requestMatch = async ({
  userId,
  topics,
  difficulty,
}: RequestMatchPayload): Promise<RequestMatchResponse> => {
  const response = await matchingServiceApiRequest<RequestMatchResponse>(
    "/match/request",
    "POST",
    {
      userId,
      topics,
      difficulty,
    },
  );
  return response;
};

export const cancelMatch = async (matchId: string): Promise<void> => {
  console.log("Cancelling match:", matchId);
  const response = await matchingServiceApiRequest<void>(
    `/match/cancel/${matchId}`,
    "DELETE",
  );
  return response;
};

export const getMatchStatus = async (
  userId: string,
): Promise<GetMatchStatusResponse> => {
  const response = await matchingServiceApiRequest<GetMatchStatusResponse>(
    `/match/status/by-user/${userId}`,
    "GET",
  );
  return response;
};
