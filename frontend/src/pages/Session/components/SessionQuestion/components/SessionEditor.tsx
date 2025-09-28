import { Editor } from "@monaco-editor/react";
import { PlayIcon, UsersIcon } from "lucide-react";
import { useState } from "react";

interface SessionEditorProps {
  language?: string;
}
export const SessionEditor = ({
  language = "javascript",
}: SessionEditorProps) => {
  const [code, setCode] = useState("// Start coding here...");
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md overflow-hidden w-full h-full shadow-4xl py-2 bg-[#1E1E1E]">
        <Editor
          height="50vh"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={(value: string | undefined) => setCode(value || "")}
        />
      </div>
      <div className="flex items-center">
        <UsersIcon className="h-4 w-4 text-gray-500 mr-1" />
        <div className="text-sm text-gray-500">2 users editing</div>
        <button
          type="button"
          className="ml-auto cursor-pointer bg-blue-500 hover:bg-blue-600/90 active:bg-blue-700 flex items-center justify-center text-white text-sm px-3 py-2 rounded-lg gap-3"
        >
          <PlayIcon className="h-4 w-4" /> Run Solution
        </button>
      </div>
    </div>
  );
};
