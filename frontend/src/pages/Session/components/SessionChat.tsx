import { MessageCircleIcon } from "lucide-react";

export const SessionChat = () => {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 font-semibold">
        <MessageCircleIcon className="w-5 h-5 text-blue-500" />
        <span>Team Chat</span>
      </div>
    </div>
  );
};
