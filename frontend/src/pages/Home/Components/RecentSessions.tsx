import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router";
import type { UserSession } from "../../../types/types";
import { Card } from "./Card";

interface RecentSessionProps {
  sessions: UserSession[];
}

export const RecentSessions = ({ sessions }: RecentSessionProps) => {
  return (
    <Card>
      <h2 className="font-bold">Recent Sessions</h2>
      {sessions.slice(0, 3).map((session) => (
        <div key={session._id} className="bg-gray-50 px-4 py-2 rounded-xl">
          <h3 className="font-medium">
            {session.question.title} - {session.question.topic}
          </h3>
          <div className="text-sm text-gray-500">
            With {session.peerName} •{" "}
            {formatDistanceToNow(session.endTimestamp)} ago
          </div>
        </div>
      ))}
      {sessions.length === 0 && (
        <p className="text-sm text-gray-500">
          You do not have any recent sessions.
        </p>
      )}
      <Link className="text-center" to={{ pathname: "/history" }}>
        View All
      </Link>
    </Card>
  );
};
