import { cancelMatch } from "../../api/MatchingService";
import { useAuth } from "../../context/AuthContext";

// For testing only
export const ClearMatchPage = () => {
	const { user } = useAuth();
	cancelMatch(user?.id || "");
	return <div>Match cancelled</div>;
};
