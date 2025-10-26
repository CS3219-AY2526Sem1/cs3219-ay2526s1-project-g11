import { CodeIcon, SparklesIcon } from "lucide-react";
import { SessionEditor } from "./components/SessionEditor";

const mockData = {
  questionName: "Two Sum",
  questionDescription:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  example:
    "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
  topics: ["Array", "Hash Table", "Two Pointers"],
  difficulty: "Easy",
  sessionPartnerUserName: "Sarah K.",
};

export const SessionQuestion = () => {
  // TODO: Fetch question and session data dynamically
  const data = mockData;

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CodeIcon className="text-blue-500 h-5 w-5" />
        <h1 className="text-2xl font-semibold">{data.questionName}</h1>
      </div>
      <div className="bg-gray-100/50 rounded-2xl p-4 text-sm leading-loose">
        <h3 className="text-gray-500">Problem:</h3>
        <p className="whitespace-pre">{data.questionDescription}</p>
        <b className="text-gray-500">Example:</b>
        <p className="whitespace-pre text-gray-500">{data.example}</p>
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
  );
};
