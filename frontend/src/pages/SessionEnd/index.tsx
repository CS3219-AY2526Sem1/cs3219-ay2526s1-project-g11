import { Editor } from "@monaco-editor/react";
import {
  CircleCheckBigIcon,
  ClockIcon,
  CodeIcon,
  MessageCircleIcon,
  RotateCcwIcon,
  TrophyIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

export const SessionEnd = () => {
  const navigate = useNavigate();
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
            <b className="text-xl">30m 53s</b>
            <p className="text-sm text-gray-500">Session Duration</p>
          </div>
          <div className="flex flex-col flex-1 items-center gap-2">
            <MessageCircleIcon className="text-green-500 w-10 h-10 p-2 bg-gray-100/50 rounded-xl" />
            <b className="text-xl">2</b>
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
            Medium
          </span>
          <span className="border border-gray-100 rounded-xl px-2 py-1">
            System Design
          </span>
        </div>
        <div className="bg-gray-100/50 p-2 rounded-lg">problemmm</div>
        <h3 className="text-sm font-semibold">Your Final Solution:</h3>
        <div className="rounded-md overflow-hidden w-full h-full shadow-4xl py-2 bg-[#1E1E1E]">
          <Editor
            value="asdfg"
            language="javascript"
            height="25vh"
            theme="vs-dark"
          />
        </div>
      </div>
      <button
        type="button"
        className="p-2 border border-gray-100 rounded-l flex gap-2 items-center hover:bg-gray-100/50 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <RotateCcwIcon className="h-4 w-4" />
        Back to Dashboard
      </button>
    </div>
  );
};
