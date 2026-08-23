import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../consts/appConstants";
import { useEndSessionMutation } from "../store/api/authApi";
import { logout } from "../store/slice/authSlice";
import { disconnectSocket } from "../utils/socket";

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [endSession] = useEndSessionMutation();

  return async () => {
    try {
      await endSession().unwrap();
    } catch {
      // Local logout must still complete if the server is temporarily unavailable.
    } finally {
      disconnectSocket();
      dispatch(logout());
      navigate(ROUTES.LOGIN);
    }
  };
}
