import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ROUTES } from "../consts/appConstants";
import { logout } from "../store/slice/authSlice";
import { disconnectSocket } from "../utils/socket";

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return () => {
    api.post("/auth/logout").catch(() => {});
    disconnectSocket();
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };
}
