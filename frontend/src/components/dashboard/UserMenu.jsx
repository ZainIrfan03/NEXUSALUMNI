import { LogOut, User } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import { getImageUrl as fileUrl } from "../../utils/getImageUrl";

export default function UserMenu({
  avatarUrl,
  displayName,
  onLogout,
  onToggle,
  onViewProfile,
  open,
  role,
}) {
  return (
    <>
      <button onClick={onToggle} className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-dark leading-tight">
            {displayName}
          </p>
          <p className="text-xs text-gray-400 capitalize">{role}</p>
        </div>
        <UserAvatar
          name={displayName}
          src={fileUrl(avatarUrl)}
          className="h-10 w-10"
          imageClassName="text-sm"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50">
          <button
            onClick={onViewProfile}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-dark hover:bg-gray-50 transition-colors"
          >
            <User size={15} /> View Profile
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </>
  );
}
