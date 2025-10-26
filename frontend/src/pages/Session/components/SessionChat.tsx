import { MessageCircleIcon, SendIcon } from "lucide-react";
import type { Channel } from "phoenix";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSessionContext } from "../../../hooks/useSessionContext";
import { twcn } from "../../../utils";

export const SessionChat = () => {
  const { user } = useAuth();
  const { socket, sessionId } = useSessionContext();

  const [messages, setMessages] = useState<{ user_id: string; text: string }[]>(
    [],
  );
  const [inputValue, setInputValue] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const isTypingRef = useRef(false);

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

  useEffect(() => {
    const channel = socket.channel(`chat:${sessionId}`);
    channelRef.current = channel;

    channel
      .join()
      .receive("ok", (response) => {
        console.log("Joined chat channel successfully");
        if (response.chat_messages && response.chat_messages.length > 0) {
          setMessages(response.chat_messages);
        }
      })
      .receive("error", (err) => {
        console.error("Failed to join chat channel:", err);
      });
    channel.on("chat:new_message", (message) => {
      console.log("Received new chat message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    channel.on("chat:error", ({ reason }: { reason: string }) =>
      console.error(`Chat error: ${reason}`),
    );
    channel.on("chat:user_typing", ({ user_id, typing }) => {
      if (user_id !== user?.id) {
        setIsPartnerTyping(typing);
      }
    });
    return () => {
      channel.off("chat:new_message");
      channel.off("chat:error");
      channel.off("chat:user_typing");
      channel.leave();
    };
  }, [sessionId, socket, user?.id]);

  useEffect(() => {
    if (!isTypingRef.current && inputValue.trim() !== "") {
      isTypingRef.current = true;
      channelRef.current?.push("chat:typing", {
        typing: true,
      });
    }
    // debounce input typing indicator
    const timer = setTimeout(() => {
      if (inputValue.trim() !== "") {
        channelRef.current?.push("chat:typing", {
          typing: false,
        });
        isTypingRef.current = false;
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [inputValue]);

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
                  "bg-blue-500 text-white ml-auto": msg.user_id === user?.id,
                  "bg-gray-100 text-black": msg.user_id !== user?.id,
                },
              )}
            >
              {msg.text}
            </div>
          );
        })}
      </div>
      {isPartnerTyping && (
        <i className="text-gray-500 animate-pulse">Partner is typing...</i>
      )}
      <div className="flex gap-2">
        <form
          className="flex-1 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim() === "") return;
            channelRef.current?.push("chat:send_message", {
              text: inputValue,
            });
            isTypingRef.current = false;
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
