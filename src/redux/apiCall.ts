import axios from "axios";
import { loginFailure, loginStart, loginSuccess, logout } from "./slice/userSlice";
import { API_URL } from "../Utils/apiRoute";
import { toast } from "react-toastify";
import { toastOptions } from "../Utils/toastOptions";

export const login = async (dispatch, user) => {
    dispatch(loginStart());

    // STEP 1: Try Super Admin login
    try {
        const res = await axios.post(API_URL + "/superadmin/login", user);
        if (res.data?.token) {
            const token = res.data.token;
            const role = "super admin";
            const userData = { role, userType: "superadmin" };

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("userRole", role);
            sessionStorage.setItem("userData", JSON.stringify(userData));

            dispatch(loginSuccess({ token, role, user: userData }));
            toast.success("Login successful!", toastOptions);
            window.location.replace("/");
            return;
        }
    } catch (superAdminError: any) {
        // If it's a 500 error (server error), stop trying
        if (superAdminError?.response?.status === 500) {
            dispatch(loginFailure());
            toast.error("Something went wrong. Please try again.", toastOptions);
            return;
        }
        // If 401/404 (wrong credentials for superadmin), try staff login
    }

    // STEP 2: Try unified Staff login
    try {
        const res = await axios.post(API_URL + "/auth/login", user);
        if (res.data?.token) {
            const token = res.data.token;
            const role = res.data.role;
            const userData = res.data.user;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("userRole", role);
            sessionStorage.setItem("userData", JSON.stringify(userData));

            dispatch(loginSuccess({ token, role, user: userData }));
            toast.success("Login successful!", toastOptions);
            window.location.replace("/");
            return;
        }
    } catch (staffError: any) {
        dispatch(loginFailure());
        const message = staffError?.response?.data?.error || "Invalid email or password";
        toast.error(message, toastOptions);
        return;
    }

    dispatch(loginFailure());
    toast.error("Invalid email or password", toastOptions);
};

export const Logout = (dispatch) => {
    dispatch(logout());
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userData");
    window.location.replace("/login");
};