import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "./authHooks";
import { logout, setCredentials } from "../store/slice/authSlice";

export default function useAuthSession() {
  const dispatch = useDispatch();
  const authChecked = useSelector((state) => state.auth.authChecked);
  const session = useGetCurrentUserQuery(undefined, { skip: authChecked });

  useEffect(() => {
    
    if (authChecked) return;
    if (session.isSuccess) dispatch(setCredentials(session.data));
    if (session.isError) dispatch(logout());
  }, [
    authChecked,
    dispatch,
    session.data,
    session.isError,
    session.isSuccess,
  ]);

  return authChecked;
}
