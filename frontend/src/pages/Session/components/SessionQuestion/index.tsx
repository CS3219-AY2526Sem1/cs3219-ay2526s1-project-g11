// biome-ignore-all lint/security/noDangerouslySetInnerHtml: content is sanitized by DOMPurify
import DOMPurify from "dompurify";
import { CodeIcon } from "lucide-react";
import { useSessionContext } from "../../../../hooks/useSessionContext";
import { SessionEditor } from "./components/SessionEditor";

export const SessionQuestion = () => {
  const { question } = useSessionContext();

  return (
    <>
      {question && (
        <div className="w-full h-[85vh] bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CodeIcon className="text-blue-500 h-5 w-5" />
            <h1 className="text-2xl font-semibold">{question.title}</h1>
          </div>
          <div className="bg-gray-100/50 rounded-2xl p-4 text-sm flex-1 overflow-y-auto">
            <h3 className="text-gray-500">Problem:</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(question.question),
              }}
            />
            <b className="text-gray-500">Example:</b>
            <p className="whitespace-pre text-gray-500">
              {question.example_testcases}
            </p>
          </div>
          <div className="flex items-center text-sm gap-2">
            <span>Shared Code Editor</span>
          </div>
          <SessionEditor />
        </div>
      )}
    </>
  );
};
