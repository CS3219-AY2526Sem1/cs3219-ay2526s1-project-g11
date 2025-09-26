import { Editor } from "@monaco-editor/react";
import { PlayIcon, UsersIcon } from "lucide-react";
import { Channel, Socket } from "phoenix";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../../../context/AuthContext";
import { computeCodeDiff } from "../../../../../utils";

interface SessionEditorProps {
  language?: string;
}
export const SessionEditor = ({
  language = "javascript",
}: SessionEditorProps) => {
  const [code, setCode] = useState("");
  const { user } = useAuth();

  // Helper values that should not trigger rerenders
  const revRef = useRef(0);
  const shadowRef = useRef("");
  const localApply = useRef(false);

  // Refs for connection that should persist 
  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);

  const WEB_SOCKET_URL = 'ws://localhost:4000/ws';
  const token = '';
  const sessionId = '';

  // Init and join the channel on mount
  useEffect(() => {
    const socket = new Socket(WEB_SOCKET_URL, {
      params: { token: token },
    });
    socket.connect();
    socketRef.current = socket;

    const channel = socket.channel(`session:${sessionId}`);
    channelRef.current = channel;

    // TODO: Type properly
    channel.join().receive("ok", (resp: any) => {
      console.log("Joined successfully", resp);

      revRef.current = resp.rev || 0;
      const initialText = resp.text || "";
      shadowRef.current = initialText;

      localApply.current = true;
      setCode(initialText);
    }).receive("error", (resp: any) => {
      console.log("Unable to join", resp);
    });

    // TODO: Type properly
    // Initialise update listener (only once)
    channel.on("code:update", (response: any) => {
      console.log("Update response:", response);
      const { rev: newRev, delta, by } = response;
      revRef.current = newRev;

      const shadowLeft = shadowRef.current.slice(0, delta.from);
      const shadowRight = shadowRef.current.slice(delta.to);
      shadowRef.current = shadowLeft + delta.text + shadowRight;
          

      if (by !== user?.id) {
        localApply.current = true;
        setCode(currentCode => {
          console.log("currentCode:", currentCode);
          console.log("Delta:", delta);
          const left = currentCode.slice(0, delta.from);
          const right = currentCode.slice(delta.to);
          const newCode = left + delta.text + right;
          
          return newCode;
        });
      }
    })
    channel.on("code:snapshot", ({rev: newRev, text}: {rev: number, text: string}) => {
      localApply.current = true;
      setCode(text);
      shadowRef.current = text;
      revRef.current = newRev;
    })
    channel.on("code:error", ({reason}: {reason: string}) => console.log("error: " + reason));
    channel.on("code:stale", () => {
      console.log("Stale revision, requesting snapshot");
      channel.push("code:request_snapshot", {})
    })


    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket");
      
      channel.off("code:update");
      channel.off("code:snapshot");
      channel.off("code:error");
      channel.off("code:stale");
      channel.leave();
      socket.disconnect();
    }
  }, [])

  const handleCodeChange = (value: string | undefined) => {
    if (localApply.current) {
      localApply.current = false;
      console.log("Skipping programmatic change");
      return;
    }
    const newCode = value || "";

    if (channelRef.current) {
      const { from, to, text } = computeCodeDiff(shadowRef.current, newCode);
      if (from !== to || text !== "") {
        channelRef.current.push("code:delta", { from, to, text, rev: revRef.current });
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md overflow-hidden w-full h-full shadow-4xl py-2 bg-[#1E1E1E]">
        <Editor
          height="50vh"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={(value: string | undefined) => handleCodeChange(value)}
        />
      </div>
      <div className="flex items-center">
        <UsersIcon className="h-4 w-4 text-gray-500 mr-1" />
        <div className="text-sm text-gray-500">2 users editing</div>
        <button className="ml-auto cursor-pointer bg-blue-500 hover:bg-blue-600/90 active:bg-blue-700 flex items-center justify-center text-white text-sm px-3 py-2 rounded-lg gap-3">
          <PlayIcon className="h-4 w-4" /> Run Solution
        </button>
      </div>
    </div>
  );
};
