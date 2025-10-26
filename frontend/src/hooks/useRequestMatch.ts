import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import {
  cancelMatchByUser,
  getMatchStatus,
  requestMatch,
} from "../api/MatchingService";
import type {
  GetMatchStatusResponse,
  RequestMatchPayload,
  RequestMatchResponse,
} from "../types/types";

export const useRequestMatch = ({ userId }: { userId: string }) => {
  const mutation = useMutation<
    RequestMatchResponse,
    unknown,
    RequestMatchPayload
  >({
    mutationKey: ["request-match", userId],
    mutationFn: async ({ topics, difficulty }: RequestMatchPayload) => {
      const response = await requestMatch({ userId, topics, difficulty });
      return response;
    },
  });
  return mutation;
};

export const useCheckStatus = ({
  userId,
  enabled = false,
}: {
  userId: string;
  enabled?: boolean;
}) => {
  const isPollingRef = useRef(false);

  const query = useQuery<GetMatchStatusResponse>({
    queryKey: ["match-status", userId],
    queryFn: async () => {
      const response = await getMatchStatus(userId);
      isPollingRef.current = response.status === 1;
      return response;
    },
    refetchInterval: (query) => {
      if (query.state.data?.status === 1) {
        // If user is waiting, poll every 2 seconds to check for updates
        return 2000;
      } else {
        isPollingRef.current = false;
        return false;
      }
    },
    enabled: enabled,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });

  const exitQueue = useCallback(async () => {
    if (isPollingRef.current && userId) {
      try {
        await cancelMatchByUser(userId);
        isPollingRef.current = false;
      } catch (error) {
        console.error("Error cancelling match:", error);
      }
    }
  }, [userId]);

  return { ...query, exitQueue };
};
