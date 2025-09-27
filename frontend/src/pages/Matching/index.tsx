import { UsersIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { cancelMatch } from "../../api/MatchingService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useCheckStatus, useRequestMatch } from "../../hooks/useRequestMatch";
import { capitalizeFirstLetter } from "../../utils";

export const MatchingPage = () => {
	const [hasJoinedQueue, setHasJoinedQueue] = useState(false);
	const [isMatchFound, setIsMatchFound] = useState(false);
	const location = useLocation();
	const matchParams = location.state || {};

	const navigate = useNavigate();

	const mutation = useRequestMatch({
		userId: matchParams.userId,
	});

	const { data, error, exitQueue } = useCheckStatus({
		userId: matchParams.userId,
		enabled: hasJoinedQueue,
	});

	const isValidParams =
		matchParams?.userId && matchParams?.topics && matchParams?.difficulty;

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount
	useEffect(() => {
		// TODO: Add error alert
		if (!isValidParams || error) {
			exitQueue();
			return;
		} else {
			mutation.mutate(
				{
					userId: matchParams.userId,
					topics: matchParams.topics,
					difficulty: matchParams.difficulty,
				},
				{
					onSuccess: (data) => {
						console.log(data);
						setHasJoinedQueue(true);
					},
					onError: (e) => {
						console.error("Match request failed:", e);
					},
				},
			);
		}
	}, []);

	useEffect(() => {
		if (data && data.status === 2) {
			// Match found
			setIsMatchFound(true);

			setTimeout(() => {
				navigate("/session", { state: { sessionId: data.matchId } });
			}, 2000);
		}
	}, [data, navigate]);

	return (
		<div className="flex flex-col items-center justify-center p-5 m-4">
			<div className="w-3/5 bg-white shadow-[5px_5px_20px] shadow-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2">
				<div className="bg-blue-500 rounded-full h-16 w-16 flex items-center justify-center mb-2 shadow-blue-500 shadow-md/50">
					<UsersIcon className="text-white h-8 w-8" />
				</div>
				<h2 className="text-2xl font-semibold">
					Finding Your Practice Partner
				</h2>
				<p className="text-gray-500 text-sm">
					Looking for someone practicing{" "}
					<b>
						{matchParams.topics
							.map((topic: string) => capitalizeFirstLetter(topic))
							.join(", ")}
					</b>{" "}
					at <b>{capitalizeFirstLetter(matchParams.difficulty)}</b> level
				</p>
				{!isMatchFound ? (
					<>
						<div className="flex items-center justify-center gap-2">
							<LoadingSpinner />
							<p className="text-sm">Matching algorithm working...</p>
						</div>
						<button
							type="button"
							className="cursor-pointer bg-gray-100/50 hover:bg-gray-100 border border-gray-200 font-semibold text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-4 mt-4"
							onClick={() =>
								cancelMatch(matchParams.userId).then(() => navigate("/"))
							}
						>
							<XIcon className="h-4 w-4 flex-shrink-0" /> Cancel Search
						</button>
					</>
				) : (
					<p className="text-sm">Match found! Redirecting to session page</p>
				)}
			</div>
		</div>
	);
};
