import axios from "axios";
import { loginFailure, loginStart, loginSuccess, logout } from "./slice/userSlice";
import { API_URL } from "../Utils/apiRoute";
import { toast } from "react-toastify";
import { toastOptions } from "../Utils/toastOptions";


export const login = async (dispatch, user) => {

    dispatch(loginStart());
    try {
        const res = await axios.post(API_URL + '/superadmin/login', user)

        if(res.data){
            toast.success('Login successfully!', toastOptions)
            const token = res.data.token
            sessionStorage.setItem('token', token)
            return dispatch(loginSuccess(token)) && window.location.replace('/');
        } else {
            toast.error('Login Failed!', toastOptions);
            return;
        }

    } catch (error) {
        console.error(error);
        dispatch(loginFailure())
        toast.error('Failed! Something went wrong', toastOptions);
        return;
    }
}

export const Logout = (dispatch) => {
    dispatch(logout());
    sessionStorage.removeItem('token');
}