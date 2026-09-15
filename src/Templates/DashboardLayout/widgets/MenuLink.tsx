import DashboardMenuIcon from "../../../Components/Vectors/DashboardMenuIcon";
import SchMgtMenuIcon from "../../../Components/Vectors/SchMgtMenuIcon";
import StaffMgtMenuIcon from "../../../Components/Vectors/StaffMgtMenuIcon";
import StudMgtMenuIcon from "../../../Components/Vectors/StudMgtMenuIcon";
import SettingsIcon from "../../../Components/Vectors/SettingsIcon";
import SupportIcon from "../../../Components/Vectors/SupportIcon";

type Sublink = { name: string; link: string };

type MenuItem = {
  icon: JSX.Element;
  name: string;
  link: string;
  sublinks?: Sublink[];
};

// Owner / admin navigation — the existing structure
const AdminMenuLinks: MenuItem[] = [
  { icon: <DashboardMenuIcon />, name: "Dashboard", link: "/" },
  {
    icon: <SchMgtMenuIcon />,
    name: "School Management",
    link: "school-management",
    sublinks: [
      { name: "Academics", link: "academics" },
      { name: "Admission", link: "admission" },
      { name: "Fee Management", link: "fee-management" },
      { name: "Inventory", link: "inventory" },
      { name: "Attendance", link: "attendance" },
    ],
  },
  { icon: <StaffMgtMenuIcon />, name: "Staff Management", link: "staff-management" },
  { icon: <StudMgtMenuIcon />, name: "Student Management", link: "student-management" },
  { icon: <SettingsIcon />, name: "Settings", link: "settings" },
  { icon: <SupportIcon />, name: "Support", link: "support" },
];

// Academic staff navigation — scoped to their own class and record
const TeacherMenuLinks: MenuItem[] = [
  { icon: <DashboardMenuIcon />, name: "Dashboard", link: "/" },
  { icon: <SchMgtMenuIcon />, name: "Attendance", link: "school-management/attendance" },
  { icon: <StudMgtMenuIcon />, name: "My students", link: "my-students" },
  { icon: <StaffMgtMenuIcon />, name: "My profile", link: "my-profile" },
  { icon: <SupportIcon />, name: "Support", link: "support" },
  { icon: <SchMgtMenuIcon />, name: "Grading", link: "grading" },
];

// Non-academic staff — own record only, until we define more
const StaffMenuLinks: MenuItem[] = [
  { icon: <DashboardMenuIcon />, name: "Dashboard", link: "/" },
  { icon: <StaffMgtMenuIcon />, name: "My profile", link: "my-profile" },
  { icon: <SupportIcon />, name: "Support", link: "support" },
];

export const getMenuLinks = (role: string, isAcademic: boolean): MenuItem[] => {
  if (role === "super admin" || role === "admin") return AdminMenuLinks;
  return isAcademic ? TeacherMenuLinks : StaffMenuLinks;
};

export default AdminMenuLinks;