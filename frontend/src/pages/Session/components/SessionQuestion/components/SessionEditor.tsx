import { Editor } from "@monaco-editor/react";
import { PlayIcon, UsersIcon } from "lucide-react";
import type { editor } from "monaco-editor";
import { type Channel, Socket } from "phoenix";
import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../../../../../context/AuthContext";
import type {
	CodeUpdateResponse,
	SessionJoinResponse,
} from "../../../../../types/types";
import { computeCodeDiff } from "../../../../../utils";

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

interface SessionEditorProps {
	language?: string;
}

export const SessionEditor = ({
	language = "javascript",
}: SessionEditorProps) => {
	const { user } = useAuth();

	const location = useLocation();
	const matchParams = location.state || {};

	// Helper values that should not trigger rerenders
	const revRef = useRef(0);
	const shadowRef = useRef("");
	const localApply = useRef(false);

	// Refs for connection that should persist
	const socketRef = useRef<Socket | null>(null);
	const channelRef = useRef<Channel | null>(null);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	const token = localStorage.getItem("authToken");

	const sessionId = matchParams.sessionId;

	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
		editorRef.current = editor;
	};

	const updateEditorContent = useCallback((newContent: string) => {
		console.log("updating editor content", newContent);
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
		const socket = new Socket(WEBSOCKET_URL, {
			params: { token: token },
		});
		socket.connect();
		socketRef.current = socket;

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
				console.log("Unable to join", resp);
			});

		channel.on("code:update", (response: CodeUpdateResponse) => {
			console.log("Update response:", response);
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
				console.log("new code", newCode);
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
			console.log(`error: ${reason}`),
		);
		channel.on("code:stale", () => {
			console.log("Stale revision, requesting snapshot");
			channel.push("code:request_snapshot", {});
		});

		return () => {
			console.log("Cleaning up socket");
			channel.off("code:update");
			channel.off("code:snapshot");
			channel.off("code:error");
			channel.off("code:stale");
			channel.leave();
			socket.disconnect();
		};
	}, [token, updateEditorContent, user, sessionId]);

	const handleCodeChange = (value: string | undefined) => {
		if (localApply.current) {
			localApply.current = false;
			return;
		}

		const newCode = value || "";

		if (channelRef.current) {
			const { from, to, text } = computeCodeDiff(shadowRef.current, newCode);
			if (from !== to || text !== "") {
				localApply.current = true;
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
		<div className="flex flex-col gap-2">
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
