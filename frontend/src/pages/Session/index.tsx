import { ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { cancelMatchByUser } from "../../api/MatchingService";
import { SessionContextProvider } from "../../hooks/useSessionContext";
import { getMatchParams } from "../../utils";
import { SessionChat } from "./components/SessionChat";
import { SessionQuestion } from "./components/SessionQuestion";

export const Session = () => {
  const location = useLocation();
  const params = location.state || {};
  const matchParams = getMatchParams();

  const startTime = sessionStorage.getItem(
    `session:${params.sessionId}:startTime`,
  );
  if (!startTime) {
    const now = Date.now();
    sessionStorage.setItem(
      `session:${params.sessionId}:startTime`,
      now.toString(),
    );
  }

  const [timer, setTimer] = useState(
    Math.floor(startTime ? (Date.now() - parseInt(startTime, 10)) / 1000 : 0),
  );

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
    return null;
  }

  // TODO: Get topic and difficulty dynamically
  return (
    <SessionContextProvider sessionId={params.sessionId}>
      <div className="mx-6 my-4">
        <div className="flex items-center mb-2 justify-center gap-2">
          <div className="px-2 py-1 bg-blue-500 text-xs font-semibold text-white rounded-2xl">
            Easy
          </div>
          <div className="px-2 py-1 border border-gray-300 text-xs font-semibold rounded-2xl">
            Topic
          </div>
          <ClockIcon className="ml-4 w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-400 font-mono">
            {minutes}:{seconds}
          </span>
          <button
            type="button"
            className="ml-auto cursor-pointer px-4 py-2 text-center font-semibold text-sm text-red-400 border border-red-400 rounded-lg hover:bg-red-400 hover:text-white transition-colors"
            onClick={() => {
              cancelMatchByUser(matchParams.userId).then(() => {
                navigate("/");
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
