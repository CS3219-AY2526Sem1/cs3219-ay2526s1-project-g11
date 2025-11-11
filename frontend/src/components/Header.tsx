import { CodeXmlIcon, LogOutIcon, UserIcon, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { handleCleanup } from "../utils";
import { CustomPopover } from "./CustomPopover";

export const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/30 backdrop-blur-sm p-4 border-b border-gray-200 flex items-center justify-start gap-2 sticky top-0 z-10">
      <span className="w-10 h-10 rounded-xl bg-blue-500 text-white font-semibold text-xs flex items-center justify-center">
        <CodeXmlIcon className="h-5 w-5" />
      </span>
      <Link to={{ pathname: "/" }} onClick={() => handleCleanup()}>
        <h3 className="text-xl font-semibold text-gray-800">PeerPrep</h3>
      </Link>
      {user && (
        <CustomPopover
          trigger={
            <button
              type="button"
              className="rounded-full bg-blue-500 w-10 h-10 ml-auto text-white text-center cursor-pointer active:bg-blue-600"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            >
              {user.username?.charAt(0).toUpperCase() || ""}
            </button>
          }
          isOpen={isProfileMenuOpen}
          setIsOpen={setIsProfileMenuOpen}
          align="end"
        >
          <div className="flex flex-col text-sm">
            <div className="items-start border-b border-gray-200 py-2 px-3">
              <p className="text-sm">{user?.username}</p>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
            <Link to={{ pathname: "/profile" }}>
              <div className="cursor-pointer flex items-center py-2 px-3 hover:bg-gray-100">
                <UserIcon className="w-4 h-4 mr-3" />
                Profile
              </div>
            </Link>
            {user.isAdmin && (
              <Link to={{ pathname: "/users" }}>
                <div className="cursor-pointer flex items-center py-2 px-3 hover:bg-gray-100">
                  <Users className="w-4 h-4 mr-3" />
                  Users
                </div>
              </Link>
            )}
            <button
              type="button"
              className="py-2 px-3 text-red-400 flex items-center cursor-pointer hover:bg-gray-100"
              onClick={() => logout()}
            >
              <LogOutIcon className="w-4 h-4 mr-3" />
              <p>Log Out</p>
            </button>
          </div>
        </CustomPopover>
      )}
    </header>
  );
};
