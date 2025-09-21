import { SessionChat } from "./components/SessionChat";
import { SessionQuestion } from "./components/SessionQuestion";

export const Session = () => {
  return (
    <div className="m-3 flex gap-4 box-border">
      <div className="flex-3">
        <SessionQuestion />
      </div>
      <div className="flex-1">
        <SessionChat />
      </div>
    </div>
  );
};
