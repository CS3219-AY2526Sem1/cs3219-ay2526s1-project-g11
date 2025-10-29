// biome-ignore-all lint/security/noDangerouslySetInnerHtml: content is sanitized by DOMPurify
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { CodeIcon, SparklesIcon } from "lucide-react";
import { useLocation } from "react-router";
import { getMatchDetails } from "../../../../api/MatchingService";
import { getQuestionById } from "../../../../api/QuestionService";
import type {
  GetMatchDetailsResponse,
  GetQuestionByIdResponse,
} from "../../../../types/types";
import { SessionEditor } from "./components/SessionEditor";

export const SessionQuestion = () => {
  const location = useLocation();
  const locationData = location.state || {};

  const { data: matchData } = useQuery<GetMatchDetailsResponse>({
    queryKey: ["session-question", locationData.sessionId],
    queryFn: async () => {
      const response = await getMatchDetails(locationData.sessionId);
      return response;
    },
  });
  const { data } = useQuery<GetQuestionByIdResponse>({
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

  return (
    <>
      {data && (
        <div className="w-full h-[85vh] bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CodeIcon className="text-blue-500 h-5 w-5" />
            <h1 className="text-2xl font-semibold">{data.title}</h1>
          </div>
          <div className="bg-gray-100/50 rounded-2xl p-4 text-sm flex-1 overflow-y-auto">
            <h3 className="text-gray-500">Problem:</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(data.question),
              }}
            />
            <b className="text-gray-500">Example:</b>
            <p className="whitespace-pre text-gray-500">
              {data.example_testcases}
            </p>
          </div>
          <div className="flex items-center text-sm gap-2">
            <span>Shared Code Editor</span>
            <button
              type="button"
              className="ml-auto cursor-pointer bg-gray-100 border hover:bg-gray-200 active:bg-gray-300 border-gray-300 px-2 py-1 rounded-lg flex gap-2 items-center justify-center"
            >
              <SparklesIcon className="h-3 w-3" />
              Explain Code
            </button>
            <button
              type="button"
              className="cursor-pointer bg-gray-100 border hover:bg-gray-200 active:bg-gray-300 border-gray-300 px-2 py-1 rounded-lg flex gap-2 items-center justify-center"
            >
              <SparklesIcon className="h-3 w-3" />
              Get Hint
            </button>
          </div>
          <SessionEditor />
        </div>
      )}
    </>
  );
};
