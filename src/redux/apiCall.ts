import axios from "axios";
import { loginFailure, loginStart, loginSuccess, logout } from "./slice/userSlice";
import { API_URL } from "../Utils/apiRoute";
import { toast } from "react-toastify";
import { toastOptions } from "../Utils/toastOptions";
import {
    INTERACTIVE_TIMEOUT_MS,
    isUnreachable,
    serverMessage,
    statusOf,
} from "../Utils/requestFailure";

export type AccountType = "staff" | "parent" | "student";

// Why a sign-in failed. The login page picks its message from this, so a
// server outage is never reported as a wrong password.
//   credentials — the backend said 401: what they typed doesn't match
//   unreachable — no answer, a timeout, or a 5xx: try again later
//   rejected    — another 4xx with its own message (e.g. a deactivated
//                 account, or a parent who has no password yet)
//   unexpected  — a 2xx with no token, or a non-network error
export type LoginFailureKind = "credentials" | "unreachable" | "rejected" | "unexpected";

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

const fail = (dispatch: any, kind: LoginFailureKind, message: string | null = null) =>
    dispatch(loginFailure({ kind, message }));

// Turn a failed request into a failure the page can describe accurately
const failFrom = (dispatch: any, err: unknown) => {
    if (isUnreachable(err)) return fail(dispatch, "unreachable");
    const status = statusOf(err);
    if (status === 401) return fail(dispatch, "credentials");
    if (status !== null) return fail(dispatch, "rejected", serverMessage(err));
    return fail(dispatch, "unexpected");
};

const post = (path: string, body: any) =>
    axios.post(API_URL + path, body, { timeout: INTERACTIVE_TIMEOUT_MS });

export const login = async (
    dispatch: any,
    credentials: any,
    accountType: AccountType = "staff"
) => {
    dispatch(loginStart());

    // ---------- Student ----------
    if (accountType === "student") {
        try {
            const res = await post("/auth/student/login", {
                studentID: credentials.studentID,
                password: credentials.password,
            });
            if (!res.data?.token) return fail(dispatch, "unexpected");
            return finishLogin(dispatch, {
                token: res.data.token,
                role: "student",
                user: res.data.user,
                mustChangePassword: res.data.mustChangePassword,
            });
        } catch (err) {
            return failFrom(dispatch, err);
        }
    }

    // ---------- Parent ----------
    if (accountType === "parent") {
        try {
            const res = await post("/auth/parent/login", {
                email: credentials.email,
                password: credentials.password,
            });
            if (!res.data?.token) return fail(dispatch, "unexpected");
            return finishLogin(dispatch, {
                token: res.data.token,
                role: "parent",
                user: res.data.user,
                mustChangePassword: res.data.mustChangePassword,
            });
        } catch (err) {
            return failFrom(dispatch, err);
        }
    }

    // ---------- Staff: super admin first, then unified staff login ----------
    try {
        const res = await post("/superadmin/login", credentials);
        if (res.data?.token) {
            return finishLogin(dispatch, {
                token: res.data.token,
                role: "super admin",
                user: { role: "super admin", userType: "superadmin" },
                mustChangePassword: false,
            });
        }
    } catch (superAdminError) {
        // The super admin endpoint answers 404 (no such super admin) or 401
        // (wrong password) for an ordinary staff member, so any 4xx means
        // "try the staff login". No answer or a 5xx means the portal is
        // down, and the staff login would only fail the same way.
        if (isUnreachable(superAdminError)) return fail(dispatch, "unreachable");
    }

    try {
        const res = await post("/auth/login", credentials);
        if (!res.data?.token) return fail(dispatch, "unexpected");
        return finishLogin(dispatch, {
            token: res.data.token,
            role: res.data.role,
            user: res.data.user,
            mustChangePassword: false,
        });
    } catch (staffError) {
        return failFrom(dispatch, staffError);
    }
};

export const Logout = (dispatch: any) => {
    dispatch(logout());
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("mustChangePassword");
    window.location.replace("/login");
};
