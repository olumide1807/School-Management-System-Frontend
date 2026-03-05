import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../Utils/apiRoute";

const baseQuery = fetchBaseQuery({
	baseUrl: API_URL,
	prepareHeaders: (headers, { getState }) => {
		headers.set("Accept", `application/json`);
		const token = (getState() as any).auth.token;
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
				url: `/superadmin/register`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		loginSuperAdmin: builder.mutation({
			query: (body) => ({
				url: `/superadmin/login`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		loginStaff: builder.mutation({
			query: (body) => ({
				url: `/staff/login`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		updateSAPassword: builder.mutation({
			query: (body) => ({
				url: `/superadmin/updatepassword`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		updateStaffPassword: builder.mutation({
			query: (id, body) => ({
				url: `/staff/${id}/password`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["auth"],
		}),
		logout: builder.query({
			query: () => ({
				url: `/logout`,
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
