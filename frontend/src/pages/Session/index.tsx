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

  const navigate = useNavigate();
  if (!matchParams || !("userId" in matchParams)) {
    navigate("/");
    return null;
  }

  return (
    <SessionContextProvider sessionId={params.sessionId}>
      <div className="m-3">
        <div className="flex items-center mb-2">
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
