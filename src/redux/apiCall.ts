import axios from "axios";
import { loginFailure, loginStart, loginSuccess, logout } from "./slice/userSlice";
import { API_URL } from "../Utils/apiRoute";
import { toast } from "react-toastify";
import { toastOptions } from "../Utils/toastOptions";

export type AccountType = "staff" | "parent" | "student";

type LoginResult = {
    token: string;
    role: string;
    user: any;
    mustChangePassword: boolean;
};

// Students and parents whose password is still the one they were issued
// land on the change-password screen before anything else.
const finishLogin = (
    dispatch: any,
    { token, role, user, mustChangePassword }: LoginResult
) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("userRole", role);
    sessionStorage.setItem("userData", JSON.stringify(user));
    sessionStorage.setItem("mustChangePassword", mustChangePassword ? "true" : "false");

    dispatch(loginSuccess({ token, role, user }));
    toast.success("Login successful!", toastOptions);
    window.location.replace(mustChangePassword ? "/change-password" : "/");
};

export const login = async (
    dispatch: any,
    credentials: any,
    accountType: AccountType = "staff"
) => {
    dispatch(loginStart());

    // ---------- Student ----------
    if (accountType === "student") {
        try {
            const res = await axios.post(API_URL + "/auth/student/login", {
                studentID: credentials.studentID,
                password: credentials.password,
            });
            if (res.data?.token) {
                return finishLogin(dispatch, {
                    token: res.data.token,
                    role: "student",
                    user: res.data.user,
                    mustChangePassword: res.data.mustChangePassword,
                });
            }
        } catch (err: any) {
            dispatch(loginFailure());
            toast.error(
                err?.response?.data?.error || "Invalid student ID or password",
                toastOptions
            );
            return;
        }
    }

    // ---------- Parent ----------
    if (accountType === "parent") {
        try {
            const res = await axios.post(API_URL + "/auth/parent/login", {
                email: credentials.email,
                password: credentials.password,
            });
            if (res.data?.token) {
                return finishLogin(dispatch, {
                    token: res.data.token,
                    role: "parent",
                    user: res.data.user,
                    mustChangePassword: res.data.mustChangePassword,
                });
            }
        } catch (err: any) {
            dispatch(loginFailure());
            toast.error(
                err?.response?.data?.error || "Invalid email or password",
                toastOptions
            );
            return;
        }
    }

    // ---------- Staff: super admin first, then unified staff login ----------
    try {
        const res = await axios.post(API_URL + "/superadmin/login", credentials);
        if (res.data?.token) {
            return finishLogin(dispatch, {
                token: res.data.token,
                role: "super admin",
                user: { role: "super admin", userType: "superadmin" },
                mustChangePassword: false,
            });
        }
    } catch (superAdminError: any) {
        if (superAdminError?.response?.status === 500) {
            dispatch(loginFailure());
            toast.error("Something went wrong. Please try again.", toastOptions);
            return;
        }
        // 401/404 — fall through to staff login
    }

    try {
        const res = await axios.post(API_URL + "/auth/login", credentials);
        if (res.data?.token) {
            return finishLogin(dispatch, {
                token: res.data.token,
                role: res.data.role,
                user: res.data.user,
                mustChangePassword: false,
            });
        }
    } catch (staffError: any) {
        dispatch(loginFailure());
        toast.error(
            staffError?.response?.data?.error || "Invalid email or password",
            toastOptions
        );
        return;
    }

    dispatch(loginFailure());
    toast.error("Invalid email or password", toastOptions);
};

export const Logout = (dispatch: any) => {
    dispatch(logout());
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("mustChangePassword");
    window.location.replace("/login");
};