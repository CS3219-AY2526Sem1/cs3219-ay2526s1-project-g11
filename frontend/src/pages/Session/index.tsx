import { useQuery } from "@tanstack/react-query";
import { ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { cancelMatchByUser, getMatchDetails } from "../../api/MatchingService";
import { getQuestionById } from "../../api/QuestionService";
import { SessionContextProvider } from "../../hooks/useSessionContext";
import type {
  GetMatchDetailsResponse,
  GetQuestionByIdResponse,
} from "../../types/types";
import { getMatchParams } from "../../utils";
import { SessionChat } from "./components/SessionChat";
import { SessionQuestion } from "./components/SessionQuestion";

export const Session = () => {
  const location = useLocation();
  const params = location.state || {};
  const matchParams = getMatchParams();

  const startTime = sessionStorage.getItem(`startTime`);
  if (!startTime) {
    const now = Date.now();
    sessionStorage.setItem(`startTime`, now.toString());
  }

  const [timer, setTimer] = useState(
    Math.floor(startTime ? (Date.now() - parseInt(startTime, 10)) / 1000 : 0),
  );
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const navigate = useNavigate();
  if (!matchParams || !("userId" in matchParams)) {
    navigate("/");
  }

  const { data: matchData } = useQuery<GetMatchDetailsResponse>({
    queryKey: ["session-question", params.sessionId],
    queryFn: async () => {
      const response = await getMatchDetails(params.sessionId);
      return response;
    },
  });
  const { data: questionData } = useQuery<GetQuestionByIdResponse>({
    queryKey: ["question-by-id", matchData?.questionId],
    queryFn: async () => {
      if (matchData?.questionId) {
        const response = await getQuestionById(matchData?.questionId);
        return response;
      } else {
        return Promise.reject("No question ID found");
      }
    },
  });

  useEffect(() => {
    if (matchData?.partnerId) {
      sessionStorage.setItem("partnerId", matchData.partnerId);
    }
  }, [matchData]);

  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  return (
    <SessionContextProvider
      sessionId={params.sessionId}
      question={questionData}
      isSessionEnded={isSessionEnded}
      setIsSessionEnded={setIsSessionEnded}
      partnerId={matchData?.partnerId || ""}
    >
      <div className="mx-6 my-4">
        <div className="flex items-center mb-2 justify-center gap-2">
          <div className="px-2 py-1 bg-blue-500 text-xs font-semibold text-white rounded-2xl">
            {questionData?.difficulty}
          </div>
          {questionData?.topic_tags.map((tag) => (
            <div
              key={tag.id}
              className="px-2 py-1 border border-gray-300 text-xs font-semibold rounded-2xl"
            >
              {tag.name}
            </div>
          ))}
          <ClockIcon className="ml-4 w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-400 font-mono">
            {timeString}
          </span>
          <button
            type="button"
            className="ml-auto cursor-pointer px-4 py-2 text-center font-semibold text-sm text-red-400 border border-red-400 rounded-lg hover:bg-red-400 hover:text-white transition-colors"
            onClick={() => {
              cancelMatchByUser(matchParams.userId).then(() => {
                setIsSessionEnded(true);
                localStorage.setItem("sessionDuration", timeString);
                localStorage.setItem(
                  "questionAttempted",
                  JSON.stringify(questionData),
                );
                navigate("/session-end");
              });
            }}
          >
            End Session
          </button>
        </div>
        <div className="flex gap-4 box-border">
          <div className="flex-3">
            <SessionQuestion />
          </div>
          <div className="flex-1 min-w-0">
            <SessionChat />
          </div>
        </div>
      </div>
    </SessionContextProvider>
  );
};
