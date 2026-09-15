export const getTeacherName = (staffList: any[], teacherId: string) => {
  if (!teacherId) return 'Not assigned';
  const teacher = staffList.find((s: any) => s._id === teacherId);
  return teacher
    ? `${teacher.firstName || ''} ${teacher.surname || teacher.lastName || ''}`.trim()
    : 'Not assigned';
};

export const getArmLabel = (arms: any[], levels: any[], armId: string) => {
  const arm = arms.find((a: any) => a._id === armId);
  if (!arm) return 'Unknown';
  const level = levels.find((l: any) => l._id === arm.classLevelId);
  return `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
};