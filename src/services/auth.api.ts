import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = "https://sms-l7y1.onrender.com";

//localhost:5002/superadmin/register

const baseQuery = fetchBaseQuery({
	baseUrl: API_URL,
	prepareHeaders: (headers, { getState }) => {
		headers.set("Accept", `application/json`);
		const token = getState().auth.token;
		if (token) headers.append("authorization", `Bearer ${token}`);
		return headers;
	},
});

export const authApi = createApi({
	baseQuery,
	reducerPath: "authApi",
	tagTypes: ["auth"],
	endpoints: (builder) => ({
		// USERS
		registerSuperAdmin: builder.mutation({
			query: (body) => ({
				url: `https://sms-l7y1.onrender.com/superadmin/register`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		loginSuperAdmin: builder.mutation({
			query: (body) => ({
				url: `https://sms-l7y1.onrender.com/superadmin/login`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		loginStaff: builder.mutation({
			query: (body) => ({
				url: `https://sms-l7y1.onrender.com/staff/login`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		updateSAPassword: builder.mutation({
			query: (body) => ({
				url: `https://sms-l7y1.onrender.com/superadmin/updatepassword`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		updateStaffPassword: builder.mutation({
			query: (id, body) => ({
				url: `https://sms-l7y1.onrender.com/staff/${id}/password`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		logout: builder.query({
			query: () => ({
				url: `https://sms-l7y1.onrender.com/logout`,
			}),
			providesTags: ["auth"],
		}),
	}),
});

export const {
	// Super Admin-
	useRegisterSuperAdminMutation,
	useLoginSuperAdminMutation,
	useUpdateSAPasswordMutation,
	useLoginStaffMutation,
	useUpdateStaffPasswordMutation,
	useLogoutQuery,
} = authApi;
