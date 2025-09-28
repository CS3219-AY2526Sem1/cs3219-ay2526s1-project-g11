import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CustomPopover } from "./CustomPopover";
import { CodeXmlIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";

export const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/30 backdrop-blur-sm p-4 border-b border-gray-200 flex items-center justify-start gap-2 sticky top-0 z-10">
      <span className="w-10 h-10 rounded-xl bg-blue-500 text-white font-semibold text-xs flex items-center justify-center">
        <CodeXmlIcon className="h-5 w-5" />
      </span>
      <Link to={{ pathname: "/" }}>
        <h3 className="text-xl font-semibold text-gray-800">PeerPrep</h3>
      </Link>
      {user && (
        <CustomPopover
          trigger={
            <button
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
            <div className="py-2 px-3 border-b border-gray-200 hover:bg-gray-100">
              <div className="cursor-pointer flex items-center">
                <SettingsIcon className="w-4 h-4 mr-3" />
                <p>Settings</p>
              </div>
            </div>
            <div
              className="py-2 px-3 text-red-400 flex items-center cursor-pointer hover:bg-gray-100"
              onClick={() => logout()}
            >
              <LogOutIcon className="w-4 h-4 mr-3" />
              <p>Log Out</p>
            </div>
          </div>
        </CustomPopover>
      )}
    </header>
  );
};
