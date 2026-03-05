import { Routes, Route, useLocation, Navigate } from "react-router-dom";

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

import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "./Templates/DashboardLayout/index";
import Settings from "./Pages/AppSettings/index";
import StaffManagement from "./Pages/Dashboard/StaffManagement/index";
import StudentManagement from "./Pages/Dashboard/StudentManagement/index";
// import StudentProfile from "./Pages/Dashboard/StudentManagement/StudentProfile/index";
import { AddStaffForm } from "./Pages/Dashboard/StaffManagement/AddStaffForm";
// import AddStudentForm from "./Pages/Forms/AddStudentForm";
// import EditStudentForm from "./Pages/Forms/EditStudentForm";
// import ScrollToTop from "./Utils/ScrollToTop";

import ViewStaffProfile from "./Pages/Dashboard/StaffManagement/ViewStaffProfile";
import EditStaffForm from "./Pages/Dashboard/StaffManagement/EditStaffForm";
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
      <Route path="/" element={currentUser ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route path="school-management/">
          <Route index element={<AdminDashboard />} />
          <Route path="academics" element={<Academics />} />
          <Route path="academics/class/:id" element={<ClassLevel />} />
          <Route path="academics/view" element={<View />} />
          <Route path="academics/view/:id" element={<ViewClassLevel />} />
          <Route path="admission" element={<Admissions />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="fee-management" element={<FeeManagement />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>
        <Route path="student-management">
          <Route index element={<StudentManagement />} />
        </Route>
        <Route path="staff-management/">
          <Route index element={<StaffManagement />} />
          <Route path="add-staff" element={<AddStaffForm />} />
          <Route path="staff-profile/:id" element={<ViewStaffProfile />} />
          <Route path="staff-profile/edit" element={<EditStaffForm />} />
        </Route>
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Auth Screens - redirect to / if already logged in */}
      <Route path="register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
      <Route path="login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
      <Route path="reset-password" element={!currentUser ? <ResetPassword /> : <Navigate to="/" />} />
      <Route path="verify-otp" element={!currentUser ? <VerifyOtp /> : <Navigate to="/" />} />
      <Route path="forgot-password" element={!currentUser ? <ForgotPassword /> : <Navigate to="/" />} />
    </Routes>
  );
}
export default AllRoutes;