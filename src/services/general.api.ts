import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut } from "../redux/slice/authSlice";
import { API_URL } from "../Utils/apiRoute";

const baseQuery = fetchBaseQuery({
	baseUrl: API_URL,
	prepareHeaders: (headers, { getState }) => {
		headers.set("Accept", `application/json`);
		const token = (getState() as any).auth.token;
		if (token) {
			headers.set("authorization", `Bearer ${token}`);
			headers.set("Access-Control-Allow-Origin", `*`);
		}
		return headers;
	},
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
	let result = await baseQuery(args, api, extraOptions);
	let err = result?.error;
	if (result?.error && err.data?._meta?.error?.message.includes("logged in")) {
		// logout
		console.log("Something went wrong, Please login again", "error");
		setTimeout(() => {
			api.dispatch(
				logOut({
					redirect: true,
				})
			);
		}, 1000);
	}
	return result;
};

export const generalApi = createApi({
	baseQuery,
	reducerPath: "generalApi",
	tagTypes: [
		"staff",
		"profile",
		"class",
		"announcement",
		"timetable",
		"session",
		"admission",
		"student",
		"parent",
		"grade",
		"subject",
	],
	endpoints: (builder) => ({
		// SUPER ADMIN
		getSAProfile: builder.query({
			query: () => ({
				url: `/superadmin/profile`,
			}),
			providesTags: ["profile"],
		}),
		updateSAProfile: builder.mutation({
			query: (body) => ({
				url: `/superadmin/profile`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["profile"],
		}),
		// STAFF
		createStaff: builder.mutation({
			query: (body) => ({
				url: `/staff/createstaff`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["profile", "staff"],
		}),
		getAllStaff: builder.query({
			query: () => ({
				url: `/staff`,
			}),
			providesTags: ["staff"],
		}),
		getStaffById: builder.query({
			query: (id) => ({
				url: `/staff/${id}`,
			}),
			providesTags: ["staff"],
		}),
		updateStaffInfo: builder.mutation({
			query: (id, body) => ({
				url: `/staff/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["staff"],
		}),
		assignClass: builder.mutation({
			query: (id, body, param) => ({
				url: `/staff/assignClass/${id}`,
				method: "PUT",
				body,
				param,
			}),
			invalidatesTags: ["staff", "class"],
		}),
		// ANNOUNCEMENTS
		createAnnouncement: builder.mutation({
			query: (body) => ({
				url: `/announcement/create`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["announcement"],
		}),
		getAllAnnouncement: builder.query({
			query: () => ({
				url: `/announcement`,
			}),
			providesTags: ["announcement"],
		}),
		getAnnouncementById: builder.query({
			query: (id) => ({
				url: `/announcement/${id}`,
			}),
			providesTags: ["announcement"],
		}),
		updateAnnouncement: builder.mutation({
			query: (id, body) => ({
				url: `/announcement/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["announcement"],
		}),
		deleteAnnouncement: builder.mutation({
			query: (id, body) => ({
				url: `/announcement/${id}`,
				method: "DELETE",
				body,
			}),
			invalidatesTags: ["announcement"],
		}),
		// CLASS
		createClass: builder.mutation({
			query: (body) => ({
				url: `/class/create`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["class"],
		}),
		createClassArms: builder.mutation({
			query: (body) => ({
				url: `/class/createArms`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["class"],
		}),
		updateClassLevel: builder.mutation({
			query: (id, body) => ({
				url: `/class/update/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["class"],
		}),
		updateClassArm: builder.mutation({
			query: (id, body) => ({
				url: `/class/update/arm/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["class"],
		}),
		deleteClassArm: builder.mutation({
			query: (id, body) => ({
				url: `/class/delete/arm/${id}`,
				method: "DELETE",
				body,
			}),
			invalidatesTags: ["class"],
		}),
		deleteClassLevel: builder.mutation({
			query: (id, body) => ({
				url: `/class/delete/${id}`,
				method: "DELETE",
				body,
			}),
			invalidatesTags: ["class"],
		}),
		getAllClassLevels: builder.query({
			query: () => ({
				url: `/class?find=level`,
			}),
			providesTags: ["class"],
		}),
		getClassLevelById: builder.query({
			query: (id) => ({
				url: `/class/${id}?find=level`,
			}),
			providesTags: ["class"],
		}),
		getAllClassArms: builder.query({
			query: () => ({
				url: `/class?find=arm`,
			}),
			providesTags: ["class"],
		}),
		getClassArmById: builder.query({
			query: (id) => ({
				url: `/class/${id}?find=arm`,
			}),
			providesTags: ["class"],
		}),
		// SUBJECT
		createSubject: builder.mutation({
			query: (body) => ({
				url: `/subject/create`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["subject"],
		}),
		addSubject: builder.mutation({
			query: (body, id) => ({
				url: `/subject/create/specific/${id}`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["subject"],
		}),
		updateSubject: builder.mutation({
			query: (body, id) => ({
				url: `/subject/${id}?find=specificSubject`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["subject"],
		}),
		deleteSubject: builder.mutation({
			query: (body, id) => ({
				url: `/subject/${id}?find=subject`,
				method: "DELETE",
				body,
			}),
			invalidatesTags: ["subject"],
		}),
		getAllSpecificSubjectsInClass: builder.query({
			query: (id) => ({
				url: `/subject/all-subjects-in-a-class/${id}`,
			}),
			providesTags: ["subject"],
		}),
		getAllSpecificSubjectsUnderSubject: builder.query({
			query: (id) => ({
				url: `/subject/all-specificSujects-under-a-subject/${id}`,
			}),
			providesTags: ["subject"],
		}),
		getSubjectById: builder.query({
			query: (id) => ({
				url: `/subject/${id}?find=subject`,
			}),
			providesTags: ["subject"],
		}),
		// TIMETABLE
		getTimetable: builder.query({
			query: (id, param) => ({
				url: `/timetable/${id}`,
				param,
			}),
			providesTags: ["timetable"],
		}),
		createTimetable: builder.mutation({
			query: (body) => ({
				url: `/timetable/create`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["timetable"],
		}),
		setPeriodTimetable: builder.mutation({
			query: (body) => ({
				url: `/timetable/set-period-time`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["timetable"],
		}),
		updateTimetable: builder.mutation({
			query: (body, id, param) => ({
				url: `/timetable/${id}`,
				method: "POST",
				body,
				param,
			}),
			invalidatesTags: ["timetable"],
		}),
		deleteTimetable: builder.mutation({
			query: (body, id, param) => ({
				url: `/timetable/${id}`,
				method: "POST",
				body,
				param,
			}),
			invalidatesTags: ["timetable"],
		}),
		// SESSION
		createSession: builder.mutation({
			query: (body) => ({
				url: `/session/create`,
				body,
			}),
			invalidatesTags: ["session"],
		}),
		// ADMISSION
		// PARENT
		createParent: builder.mutation({
			query: (body) => ({
				url: `/parent`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["admission", "parent"],
		}),
		editParent: builder.mutation({
			query: (body, id) => ({
				url: `/parent/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["admission", "parent"],
		}),
		linkStudent: builder.mutation({
			query: (body, id) => ({
				url: `/parent/student/link/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["admission", "parent"],
		}),
		deleteParent: builder.mutation({
			query: (body, id) => ({
				url: `/parent/${id}`,
				method: "DELETE",
				body,
			}),
			invalidatesTags: ["admission", "parent"],
		}),
		getAllParents: builder.query({
			query: () => ({
				url: `/parent?type=linked`,
			}),
			providesTags: ["admission", "parent"],
		}),
		// STUDENT
		registerStudent: builder.mutation({
			query: (body) => ({
				url: `/student/register`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["admission", "student"],
		}),
		linkGuardian: builder.mutation({
			query: (body, id) => ({
				url: `/student/guardian/link/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["admission", "student"],
		}),
		editStudent: builder.mutation({
			query: (body, id) => ({
				url: `/student/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["admission", "student"],
		}),
		deleteStudent: builder.mutation({
			query: (body, id) => ({
				url: `/student/${id}`,
				method: "DELETE",
				body,
			}),
			invalidatesTags: ["admission", "student"],
		}),
		activateDeactivateStudent: builder.mutation({
			query: (body, id, status) => ({
				url: `/student/${status}/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: ["admission", "student"],
		}),
		getAllStudents: builder.query({
			query: () => ({
				url: `/student`,
			}),
			providesTags: ["admission", "student"],
		}),
		// GRADE
		createGrade: builder.mutation({
			query: (body) => ({
				url: `/grade/create`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["grade"],
		}),
		getGradeById: builder.query({
			query: (id) => ({
				url: `/grade/${id}`,
			}),
			providesTags: ["grade"],
		}),
	}),
});

export const {
	// SUPER ADMIN
	useGetSAProfileQuery,
	useUpdateSAProfileMutation,
	// STAFF
	useCreateStaffMutation,
	useGetAllStaffQuery,
	useGetStaffByIdQuery,
	useUpdateStaffInfoMutation,
	useAssignClassMutation,
	// ANNOUNCEMENTS
	useCreateAnnouncementMutation,
	useUpdateAnnouncementMutation,
	useGetAllAnnouncementQuery,
	useGetAnnouncementByIdQuery,
	useDeleteAnnouncementMutation,
	// CLASS
	useCreateClassMutation,
	useCreateClassArmsMutation,
	useGetAllClassLevelsQuery,
	useGetAllClassArmsQuery,
	useUpdateClassArmMutation,
	useUpdateClassLevelMutation,
	useDeleteClassArmMutation,
	useDeleteClassLevelMutation,
	useGetClassArmByIdQuery,
	useGetClassLevelByIdQuery,
	// SUBJECT
	useCreateSubjectMutation,
	useAddSubjectMutation,
	useGetAllSpecificSubjectsInClassQuery,
	useGetAllSpecificSubjectsUnderSubjectQuery,
	useGetSubjectByIdQuery,
	useUpdateSubjectMutation,
	useDeleteSubjectMutation,
	// TIMETABLE
	useCreateTimetableMutation,
	useUpdateTimetableMutation,
	useDeleteTimetableMutation,
	useGetTimetableQuery,
	useSetPeriodTimetableMutation,
	// SESSION
	useCreateSessionMutation,
	// ADMISSION - STUDENT
	useRegisterStudentMutation,
	useLinkGuardianMutation,
	useDeleteStudentMutation,
	useEditStudentMutation,
	useActivateDeactivateStudentMutation,
	useGetAllStudentsQuery,
	// ADMISSION - PARENT
	useCreateParentMutation,
	useLinkStudentMutation,
	useEditParentMutation,
	useDeleteParentMutation,
	useGetAllParentsQuery,
	// GRADE
	useCreateGradeMutation,
	useGetGradeByIdQuery,
} = generalApi;
