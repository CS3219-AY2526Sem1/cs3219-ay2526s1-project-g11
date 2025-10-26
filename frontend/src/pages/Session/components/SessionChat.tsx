import { MessageCircleIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { twcn } from "../../../utils";

export const SessionChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ userId: string; text: string }[]>([
    { userId: "1", text: "Hello, how are you?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: This should run whenever messages changes
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full h-[calc(100vh-96px)] sticky top-[85px] bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 font-semibold">
        <MessageCircleIcon className="w-5 h-5 text-blue-500" />
        <span>Team Chat</span>
      </div>
      <div
        className="flex-1 flex flex-col gap-2 overflow-y-auto"
        ref={messagesContainerRef}
      >
        {messages.map((msg, index) => {
          return (
            <div
              // TODO: Add unique key for each message
              // biome-ignore lint/suspicious/noArrayIndexKey: This is a static list with no id yet. Will fix when chat socket is actually implemented.
              key={index}
              className={twcn(
                "text-sm p-2 rounded-lg w-fit max-w-3/4 break-words",
                {
                  "bg-blue-500 text-white ml-auto": msg.userId === user?.id,
                  "bg-gray-100 text-black": msg.userId !== user?.id,
                },
              )}
            >
              {msg.text}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <form
          className="flex-1 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim() === "") return;
            setMessages((prev) => [
              ...prev,
              { userId: user?.id || "0", text: inputValue },
            ]);
            setInputValue("");
          }}
        >
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue}
          />
          <button
            className="cursor-pointer bg-blue-500 hover:bg-blue-600/90 active:bg-blue-700 text-white px-3 py-2 rounded-lg"
            type="submit"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
