import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import usePermissions from "./hooks/usePermissions";
//auth
import Register from "./Pages/Auth/Register";
import ResetPassword from "./Pages/Auth/ResetPassword";
import Login from "./Pages/Auth/Login";
import VerifyOtp from "./Pages/Auth/VerifyOtp";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
//dashboards
import AdminDashboard from "./Pages/Dashboard/Home";
import Academics from "./Pages/Dashboard/SchoolManagement/Academics";
import Admissions from "./Pages/Dashboard/SchoolManagement/Admissions";
import Attendance from "./Pages/Dashboard/SchoolManagement/Attendance";
import FeeManagement from "./Pages/Dashboard/SchoolManagement/FeeManagement";
import Inventory from "./Pages/Dashboard/SchoolManagement/Inventory";
import Support from "./Pages/Support";
import ClassLevel from "./Pages/Dashboard/SchoolManagement/Academics/tabs/tab2/ClassLevel";
import View from "./Pages/Dashboard/SchoolManagement/Academics/tabs/tab2/View";
import ViewClassLevel from "./Pages/Dashboard/SchoolManagement/Academics/tabs/tab2/ViewClassLevel";
import Results from "./Pages/Dashboard/Results";
import ChangePassword from "./Pages/Auth/ChangePassword";

import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "./Templates/DashboardLayout/index";
import Settings from "./Pages/AppSettings/index";
import StaffManagement from "./Pages/Dashboard/StaffManagement/index";
import StudentManagement from "./Pages/Dashboard/StudentManagement/index";
import ViewStudentProfile from "./Pages/Dashboard/StudentManagement/ViewStudentProfile";
import ViewParentProfile from "./Pages/Dashboard/StudentManagement/ViewParentProfile";
import PromoteStudents from "./Pages/Dashboard/StudentManagement/PromoteStudents";
// import StudentProfile from "./Pages/Dashboard/StudentManagement/StudentProfile/index";
import { AddStaffForm } from "./Pages/Dashboard/StaffManagement/AddStaffForm";
import Grading from "./Pages/Dashboard/Grading";
// import AddStudentForm from "./Pages/Forms/AddStudentForm";
// import EditStudentForm from "./Pages/Forms/EditStudentForm";
// import ScrollToTop from "./Utils/ScrollToTop";

import StaffAttendance from "./Pages/Dashboard/StaffManagement/StaffAttendance";
import MyStudents from "./Pages/Dashboard/MyStudents";
import ViewStaffProfile from "./Pages/Dashboard/StaffManagement/ViewStaffProfile";
// import EditStaffForm from "./Pages/Dashboard/StaffManagement/EditStaffForm";
import { useEffect } from "react";
import { getTokenExpirationTime } from "./Utils/jwtDecode";
import { logout } from "./redux/slice/userSlice";
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
function AllRoutes() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.user);

  useEffect(() => {
    if (currentUser) {
      const expirationTime = getTokenExpirationTime(currentUser);
      const currentTime = Date.now();
      if (expirationTime) {
        const timeLeft = expirationTime - currentTime;
        if (timeLeft <= 0) {
          dispatch(logout());
        } else {
          const timer = setTimeout(() => {
            dispatch(logout());
          }, timeLeft);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentUser, dispatch]);

  const permissions = usePermissions();

  return (
    // <Routes>
    //   {/* DashBoard Screens */}
    //   <Route path="/" element={currentUser ? <DashboardLayout /> : <Login />}>
    //     <Route path="school-management/">
    //       <Route
    //         index
    //         element={!currentUser ? <AdminDashboard /> : <Login />}
    //       />
    //       <Route
    //         path="academics"
    //         element={currentUser ? <Academics /> : <Login />}
    //       />
    //       <Route
    //         path="academics/class/:id"
    //         element={currentUser ? <ClassLevel /> : <Login />}
    //       />
    //       <Route
    //         path="academics/view"
    //         element={currentUser ? <View /> : <Login />}
    //       />
    //       <Route
    //         path="academics/view/:id"
    //         element={currentUser ? <ViewClassLevel /> : <Login />}
    //       />
    //       <Route
    //         path="admission"
    //         element={currentUser ? <Admissions /> : <Login />}
    //       />
    //       <Route
    //         path="attendance"
    //         element={currentUser ? <Attendance /> : <Login />}
    //       />
    //       <Route
    //         path="fee-management"
    //         element={currentUser ? <FeeManagement /> : <Login />}
    //       />
    //       <Route
    //         path="inventory"
    //         element={currentUser ? <Inventory /> : <Login />}
    //       />
    //     </Route>
    //     <Route path="student-management">
    //       <Route
    //         index
    //         element={currentUser ? <StudentManagement /> : <Login />}
    //       />
    //     </Route>
    //     <Route path="staff-management/">
    //       <Route
    //         index
    //         element={currentUser ? <StaffManagement /> : <Login />}
    //       />
    //       <Route
    //         path="add-staff"
    //         element={currentUser ? <AddStaffForm /> : <Login />}
    //       />
    //       <Route
    //         path="staff-profile/:id"
    //         element={currentUser ? <ViewStaffProfile /> : <Login />}
    //       />
    //       <Route
    //         path="staff-profile/edit"
    //         element={currentUser ? <EditStaffForm /> : <Login />}
    //       />
    //     </Route>
    //     <Route path="support" element={currentUser ? <Support /> : <Login />} />
    //     <Route
    //       path="settings"
    //       element={currentUser ? <Settings /> : <Login />}
    //     />
    //     <Route path="support" element={currentUser ? <Support /> : <Login />} />
    //   </Route>

    //   {/* Auth Screens */}
    //   <Route path="register" element={<Register />} />
    //   <Route path="login" element={<Login />} />
    //   <Route
    //     path="reset-password"
    //     element={!currentUser ? <ResetPassword /> : <DashboardLayout />}
    //   />
    //   <Route
    //     path="verify-otp"
    //     element={!currentUser ? <VerifyOtp /> : <DashboardLayout />}
    //   />
    //   <Route
    //     path="forgot-password"
    //     element={!currentUser ? <ForgotPassword /> : <DashboardLayout />}
    //   />
    // </Routes>
    <Routes>
      {/* DashBoard Screens - Protected: redirect to /login if not authenticated */}
      <Route
        path="/change-password"
        element={currentUser ? <ChangePassword /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={
          !currentUser ? (
            <Navigate to="/login" />
          ) : sessionStorage.getItem("mustChangePassword") === "true" ? (
            <Navigate to="/change-password" />
          ) : (
            <DashboardLayout />
          )
        }
      >
        <Route path="school-management/">
          <Route index element={permissions.canAccessSchoolManagement ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="academics" element={permissions.canAccessAcademics ? <Academics /> : <Navigate to="/" />} />
          <Route path="academics/class/:id" element={permissions.canAccessAcademics ? <ClassLevel /> : <Navigate to="/" />} />
          <Route path="academics/view" element={permissions.canAccessAcademics ? <View /> : <Navigate to="/" />} />
          <Route path="academics/view/:id" element={permissions.canAccessAcademics ? <ViewClassLevel /> : <Navigate to="/" />} />
          <Route path="attendance" element={permissions.canAccessAttendance ? <Attendance /> : <Navigate to="/" />} />
          <Route path="admission" element={permissions.canAccessAdmission ? <Admissions /> : <Navigate to="/" />} />
          <Route path="fee-management" element={permissions.canAccessFeeManagement ? <FeeManagement /> : <Navigate to="/" />} />
          <Route path="results" element={permissions.canAccessAcademics ? <Results /> : <Navigate to="/" />} />
          <Route path="inventory" element={permissions.canAccessInventory ? <Inventory /> : <Navigate to="/" />} />
        </Route>
        <Route path="student-management">
          <Route index element={permissions.canAccessStudentManagement ? <StudentManagement /> : <Navigate to="/" />} />
          <Route path="student-profile/:id" element={permissions.canAccessStudentManagement ? <ViewStudentProfile /> : <Navigate to="/" />} />
          <Route path="parent-profile/:id" element={<ViewParentProfile />} />
          <Route path="promote" element={<PromoteStudents />} />
        </Route>
        <Route path="staff-management/">
          <Route index element={permissions.canAccessStaffManagement ? <StaffManagement /> : <Navigate to="/" />} />
          <Route path="add-staff" element={permissions.canAccessStaffManagement ? <AddStaffForm /> : <Navigate to="/" />} />
          <Route path="staff-profile/:id" element={permissions.canAccessStaffManagement ? <ViewStaffProfile /> : <Navigate to="/" />} />
          <Route path="attendance" element={permissions.canAccessStaffManagement ? <StaffAttendance /> : <Navigate to="/" />} />
          {/* <Route path="staff-profile/edit" element={<EditStaffForm />} /> */}
        </Route>
        <Route path="grading" element={<Grading />} />
        <Route path="my-students" element={<MyStudents />} />
        <Route path="my-profile" element={<ViewStaffProfile />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={permissions.canAccessSettings ? <Settings /> : <Navigate to="/" />} />
      </Route>

      {/* Auth Screens - redirect to / if already logged in */}
      <Route
        path="register"
        element={!currentUser ? <Register /> : <Navigate to="/" />}
      />
      <Route
        path="login"
        element={!currentUser ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="reset-password"
        element={!currentUser ? <ResetPassword /> : <Navigate to="/" />}
      />
      <Route
        path="verify-otp"
        element={!currentUser ? <VerifyOtp /> : <Navigate to="/" />}
      />
      <Route
        path="forgot-password"
        element={!currentUser ? <ForgotPassword /> : <Navigate to="/" />}
      />
    </Routes>
  );
}
export default AllRoutes;
