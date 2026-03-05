import DashboardMenuIcon from "../../../Components/Vectors/DashboardMenuIcon";
import SchMgtMenuIcon from "../../../Components/Vectors/SchMgtMenuIcon";
import StaffMgtMenuIcon from "../../../Components/Vectors/StaffMgtMenuIcon";
import StudMgtMenuIcon from "../../../Components/Vectors/StudMgtMenuIcon";
import SettingsIcon from "../../../Components/Vectors/SettingsIcon";
import SupportIcon from "../../../Components/Vectors/SupportIcon";

const MenuLinks = [
  {
    icon: <DashboardMenuIcon />,
    name: "Dashboard",
    link: "/",
  },
  {
    icon: <SchMgtMenuIcon />,
    name: "School Management",
    link: "school-management",
    sublinks: [
      {
        name: "Academics",
        link: "academics",
      },
      {
        name: "Admission",
        link: "admission",
      },
      {
        name: "Fee Management",
        link: "fee-management",
      },
      {
        name: "Inventory",
        link: "inventory",
      },
      {
        name: "Attendance",
        link: "attendance",
      },
    ],
  },
  {
    icon: <StaffMgtMenuIcon />,
    name: "Staff Management",
    link: "staff-management",
    sublinks: [
      {
        name: "staff profile",
        link: "staff-profile",
      },
      {
        name: "add staff",
        link: "add-staff",
      },
    ],
  },
  {
    icon: <StudMgtMenuIcon />,
    name: "Student Management",
    link: "student-management",
    sublinks: [
      {
        name: "student profile",
        link: "student-profile",
      },
      {
        name: "add student",
        link: "add-student",
      },
    ],
  },
  {
    icon: <SettingsIcon />,
    name: "Settings",
    link: "settings",
  },
  {
    icon: <SupportIcon />,
    name: "Support",
    link: "support",
  },
];

export default MenuLinks;
