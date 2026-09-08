import { useSelector } from "react-redux";

type Role = "super admin" | "admin" | "academic" | "non-academic";

interface Permissions {
  role: Role | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;        // isAdmin staff
  isTeacher: boolean;      // academic staff
  isNonAcademic: boolean;  // non-academic staff
  isStaff: boolean;        // any staff (not super admin)
  // Page-level access
  canAccessSchoolManagement: boolean;
  canAccessAcademics: boolean;
  canAccessAdmission: boolean;
  canAccessFeeManagement: boolean;
  canAccessInventory: boolean;
  canAccessAttendance: boolean;
  canAccessStaffManagement: boolean;
  canAccessStudentManagement: boolean;
  canAccessSettings: boolean;
  canAccessReports: boolean;
  // Action-level access
  canEditStudents: boolean;
  canEditStaff: boolean;
  canRecordPayments: boolean;
  canMarkAttendance: boolean;
  canViewAllClasses: boolean; // false for teachers (only their class)
}

export const usePermissions = (): Permissions => {
  const role = useSelector((state: any) => state.user?.role) as Role | null;

  const isSuperAdmin = role === "super admin";
  const isAdmin = role === "admin";
  const isTeacher = role === "academic";
  const isNonAcademic = role === "non-academic";
  const isStaff = isAdmin || isTeacher || isNonAcademic;

  return {
    role,
    isSuperAdmin,
    isAdmin,
    isTeacher,
    isNonAcademic,
    isStaff,

    // Page access
    canAccessSchoolManagement: isSuperAdmin || isAdmin,
    canAccessAcademics: isSuperAdmin || isAdmin || isTeacher,
    canAccessAdmission: isSuperAdmin || isAdmin,
    canAccessFeeManagement: isSuperAdmin || isAdmin,
    canAccessInventory: isSuperAdmin || isAdmin,
    canAccessAttendance: isSuperAdmin || isAdmin || isTeacher,
    canAccessStaffManagement: isSuperAdmin || isAdmin,
    canAccessStudentManagement: isSuperAdmin || isAdmin || isTeacher,
    canAccessSettings: isSuperAdmin,
    canAccessReports: isSuperAdmin || isAdmin,

    // Action access
    canEditStudents: isSuperAdmin || isAdmin,
    canEditStaff: isSuperAdmin || isAdmin,
    canRecordPayments: isSuperAdmin || isAdmin,
    canMarkAttendance: isSuperAdmin || isAdmin || isTeacher,
    canViewAllClasses: isSuperAdmin || isAdmin, // teachers only see their class
  };
};

export default usePermissions;