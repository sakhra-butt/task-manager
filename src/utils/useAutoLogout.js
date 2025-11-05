import { useEffect, useRef } from "react";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import { logout } from "../features/authSlice";

const AUTO_LOGOUT_TIME = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 14 * 60 * 1000; // 14 minutes (1 minute before logout)

export function useAutoLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logoutTimer = useRef();
  const warningTimer = useRef();
  const warningToastId = useRef();

  useEffect(() => {
    const resetTimers = () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (warningToastId.current) {
        toast.dismiss(warningToastId.current);
        warningToastId.current = null;
      }

      warningTimer.current = setTimeout(() => {
        warningToastId.current = toast(
          "You will be logged out in 1 minute due to inactivity.",
          { icon: "⏰", duration: 60000 }
        );
      }, WARNING_TIME);

      logoutTimer.current = setTimeout(() => {
        if (warningToastId.current) toast.dismiss(warningToastId.current);
        dispatch(logout());
        navigate("/login");
      }, AUTO_LOGOUT_TIME);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimers));

    resetTimers();

    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (warningToastId.current) toast.dismiss(warningToastId.current);
      events.forEach((event) => window.removeEventListener(event, resetTimers));
    };
  }, [dispatch, navigate]);
} 