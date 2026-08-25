import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../consts/appConstants";
import { useEndSessionMutation } from "./authHooks";
import { logout } from "../store/slice/authSlice";
import { disconnectSocket } from "../utils/socket";

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [endSession] = useEndSessionMutation();

  return async () => {
    try {
      await endSession().unwrap();
    } catch (error) {
      void error;
    } finally {
      disconnectSocket();
      dispatch(logout());
      navigate(ROUTES.LOGIN);
    }
  };
}
