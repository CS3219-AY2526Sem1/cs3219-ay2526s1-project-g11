import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      Logged in! Welcome {user?.username}{" "}
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

export default Home;
