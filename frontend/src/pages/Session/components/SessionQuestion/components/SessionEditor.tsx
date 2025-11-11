import { Editor } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { Channel } from "phoenix";
import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "../../../../../context/AuthContext";
import { useSessionContext } from "../../../../../hooks/useSessionContext";
import type {
  CodeUpdateResponse,
  SessionJoinResponse,
} from "../../../../../types/types";
import { computeCodeDiff } from "../../../../../utils";

interface SessionEditorProps {
  language?: string;
}

export const SessionEditor = ({
  language = "javascript",
}: SessionEditorProps) => {
  const { user } = useAuth();
  const { sessionId, socket, isSessionEnded } = useSessionContext();

  // Helper values that should not trigger rerenders
  const revRef = useRef(0);
  const shadowRef = useRef("");
  const localApply = useRef(false);

  // Refs for connection that should persist
  const channelRef = useRef<Channel | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const updateEditorContent = useCallback((newContent: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      // Save current cursor position
      const position = editor.getPosition();

      localApply.current = true;
      editor.setValue(newContent);

      const totalLines = editor.getModel()?.getLineCount() || 1;
      // Restore cursor position
      if (position && position.lineNumber <= totalLines) {
        editor.setPosition(position);
      }
    }
  }, []);

  // Init and join the channel on mount
  useEffect(() => {
    const channel = socket.channel(`session:${sessionId}`);
    channelRef.current = channel;

    channel
      .join()
      .receive("ok", (resp: SessionJoinResponse) => {
        console.log("Joined successfully", resp);

        revRef.current = resp.rev || 0;
        const initialText = resp.text || "";
        shadowRef.current = initialText;

        if (editorRef.current) {
          updateEditorContent(initialText);
        }
      })
      .receive("error", (resp: { resp: { reason: string } }) => {
        console.error("Unable to join", resp);
      });

    channel.on("code:update", (response: CodeUpdateResponse) => {
      const { rev: newRev, delta, by } = response;
      revRef.current = newRev;

      if (by !== user?.id) {
        const shadowLeft = shadowRef.current.slice(0, delta.from);
        const shadowRight = shadowRef.current.slice(delta.to);
        shadowRef.current = shadowLeft + delta.text + shadowRight;

        // Get current content directly from editor
        const currentCode = editorRef.current?.getValue() || "";
        const left = currentCode.slice(0, delta.from);
        const right = currentCode.slice(delta.to);
        const newCode = left + delta.text + right;

        // Update content while preserving cursor
        updateEditorContent(newCode);
      }
    });
    channel.on(
      "code:snapshot",
      ({ rev: newRev, text }: { rev: number; text: string }) => {
        console.log("received snapshot", text);
        updateEditorContent(text);
        shadowRef.current = text;
        revRef.current = newRev;
      },
    );

    channel.on("code:error", ({ reason }: { reason: string }) =>
      console.error(`error: ${reason}`),
    );
    channel.on("code:stale", () => {
      console.log("Stale revision, requesting snapshot");
      channel.push("code:request_snapshot", {});
    });

    return () => {
      console.log("leaving channel");
      channel.off("code:update");
      channel.off("code:snapshot");
      channel.off("code:error");
      channel.off("code:stale");
      channel.leave();
      channelRef.current = null;
    };
  }, [updateEditorContent, user, sessionId, socket]);

  useEffect(() => {
    if (isSessionEnded) {
      localStorage.setItem("finalSolution", JSON.stringify(shadowRef.current));
    }
  }, [isSessionEnded]);

  const handleCodeChange = (value: string | undefined) => {
    if (localApply.current) {
      localApply.current = false;
      return;
    }

    const newCode = value || "";

    if (channelRef.current) {
      const { from, to, text } = computeCodeDiff(shadowRef.current, newCode);
      if (from !== to || text !== "") {
        channelRef.current.push("code:delta", {
          from,
          to,
          text,
          rev: revRef.current,
        });
        shadowRef.current = newCode;
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 h-1/2">
      <div className="rounded-md overflow-hidden w-full h-full shadow-4xl py-2 bg-[#1E1E1E]">
        <Editor
          height="50vh"
          theme="vs-dark"
          language={language}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
};
