// biome-ignore-all lint/security/noDangerouslySetInnerHtml: content is sanitized by DOMPurify
import { Editor } from "@monaco-editor/react";
import DOMPurify from "dompurify";
import {
  CircleCheckBigIcon,
  ClockIcon,
  CodeIcon,
  MessageCircleIcon,
  RotateCcwIcon,
  TrophyIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useAddSession } from "../../hooks/useAddSession";

export const SessionEnd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasSentStats = useRef(false);

  const finalSolutionData = localStorage.getItem("finalSolution");
  const finalSolution =
    finalSolutionData && finalSolutionData !== "undefined"
      ? JSON.parse(finalSolutionData)
      : null;
  const questionAttemptedData = localStorage.getItem("questionAttempted");
  const questionAttempted =
    questionAttemptedData && questionAttemptedData !== "undefined"
      ? JSON.parse(questionAttemptedData)
      : null;
  const durationString = localStorage.getItem("sessionDuration");
  const messageCount = localStorage.getItem("messageCount");

  const partnerId = sessionStorage.getItem("partnerId");
  const startTimestamp = sessionStorage.getItem("startTime");

  const mutation = useAddSession({
    userId: user?.id || "",
    partnerId: partnerId || "",
    startTimestamp: startTimestamp || "",
    durationString: durationString || "",
    questionAttempted: questionAttempted || {},
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount
  useEffect(() => {
    if (!questionAttempted || !partnerId) {
      navigate("/");
    }
    if (hasSentStats.current) return;
    hasSentStats.current = true;
    mutation.mutate();

    return () => {
      const authToken = localStorage.getItem("authToken");
      localStorage.clear();
      if (authToken) {
        localStorage.setItem("authToken", authToken);
      }
      sessionStorage.clear();
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-4 gap-4">
      <CircleCheckBigIcon className="h-16 w-16 p-4 text-white rounded-full bg-green-500" />
      <h1 className="text-3xl font-bold">Session Complete!</h1>
      <p className="text-gray-500">
        Great job practicing <b>System Design</b> at <b>Medium</b> level
      </p>
      <div className="bg-white rounded-lg shadow-md p-4 w-1/2">
        <div className="flex items-center gap-3">
          <TrophyIcon className="text-blue-500 w-[18px] h-[18px]" />
          <h2 className="font-semibold text-2xl">Session Overview</h2>
        </div>
        <div className="flex mt-4">
          <div className="flex flex-col flex-1 items-center gap-2">
            <ClockIcon className="text-blue-500 w-10 h-10 p-2 bg-gray-100/50 rounded-xl" />
            <b className="text-xl">{durationString}</b>
            <p className="text-sm text-gray-500">Session Duration</p>
          </div>
          <div className="flex flex-col flex-1 items-center gap-2">
            <MessageCircleIcon className="text-green-500 w-10 h-10 p-2 bg-gray-100/50 rounded-xl" />
            <b className="text-xl">{messageCount}</b>
            <p className="text-sm text-gray-500">Messages Exchanged</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 w-1/2 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <CodeIcon className="text-blue-500 w-[18px] h-[18px]" />
          <h2 className="font-semibold text-2xl">Problem Attempted</h2>
        </div>
        <div className="text-xs font-semibold">
          <span className="text-white bg-blue-500 rounded-xl px-2 py-1 mr-2">
            {questionAttempted?.difficulty}
          </span>
          {questionAttempted?.topic_tags?.map(
            (tag: { id: string; name: string; slug: string }) => (
              <span
                key={tag.id}
                className="border border-gray-100 rounded-xl px-2 py-1"
              >
                {tag.name}
              </span>
            ),
          )}
        </div>
        <div className="max-h-[30vh] overflow-y-auto bg-gray-100/50 p-2 rounded-lg">
          <h2 className="font-semibold mb-2">{questionAttempted?.title}</h2>
          <div
            className="text-sm flex flex-col gap-1 [&_pre]:w-full [&_pre]:whitespace-pre-wrap [&_pre]:break-words text-gray-500"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(questionAttempted?.question),
            }}
          />
        </div>
        <h3 className="text-sm font-semibold">Your Final Solution:</h3>
        <div className="rounded-md w-full h-full shadow-4xl py-2 bg-[#1E1E1E]">
          <Editor
            value={finalSolution || ""}
            language="javascript"
            height="25vh"
            theme="vs-dark"
            options={{ readOnly: true }}
          />
        </div>
      </div>
      <button
        type="button"
        className="p-2 border border-gray-100 rounded-l flex gap-2 items-center hover:bg-gray-100/50 cursor-pointer"
        onClick={() => {
          navigate("/");
        }}
      >
        <RotateCcwIcon className="h-4 w-4" />
        Back to Dashboard
      </button>
    </div>
  );
};
