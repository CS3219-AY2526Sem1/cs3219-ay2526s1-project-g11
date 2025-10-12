import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export const TestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = () => {
    const mockData = {
      userId: user?.id || "",
      difficulty: "medium",
      topics: ["arrays", "strings"],
    };
    const matchingParams = { ...mockData };
    sessionStorage.setItem("matchingParams", JSON.stringify(matchingParams));
    navigate("/matching", { state: matchingParams });
  };

  return (
    <div className="inline-flex flex-col p-4 gap-2">
      <div>Test Page</div>
      <button
        type="button"
        className="bg-blue-500 rounded p-2 text-white text-center cursor-pointer"
        onClick={handleNavigation}
      >
        Test Match
      </button>
    </div>
  );
};
