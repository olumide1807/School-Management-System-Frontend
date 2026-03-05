export interface StudentData {
  profile_image: string;
  img_blob: string;
  surname: string;
  first_name: string;
  other_name: string;
  gender: string;
  student_no: string;
  level: string;
  arm: string;
  email: string;
  phone: string;
  religion: string;
  dob: string;
  country: string;
  state: string;
  lga: string;
  home_address: string;
}

export interface GuardianLink {
  guardian_id: string;
  guardian_name: string;
  relationship: string;
}

export interface GuardianData {
  guardian: string;
  relationship: string;
  title: string;
  parent_surname: string;
  parent_first_name: string;
  parent_other_name: string;
  parent_gender: string;
  marital_status: string;
  parent_email: string;
  parent_phone: string;
  alt_phone: string;
  occupation: string;
  parent_home_address: string;
  guardian_link: GuardianLink[];
}

export interface StudentLink {
  student_id: string;
  student_name: string;
  relationship: string;
}
export interface ParentData {
  guardian: string;
  relationship: string;
  title: string;
  parent_surname: string;
  parent_first_name: string;
  parent_other_name: string;
  parent_gender: string;
  marital_status: string;
  parent_email: string;
  parent_phone: string;
  alt_phone: string;
  occupation: string;
  parent_home_address: string;
  student_link: StudentLink[];
}

export interface Option {
  value: string;
  label: string;
}

export interface StudentContextType {
  studentData: StudentData;
  setStudentData: React.Dispatch<React.SetStateAction<StudentData>>;
  handleParentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  guardianData: GuardianData;
  setParentData: React.Dispatch<React.SetStateAction<ParentData>>;
  parentData: ParentData;
  setGuardianData: React.Dispatch<React.SetStateAction<GuardianData>>;
  handleStudentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGuardianLinkChange: (
    index: number,
    input: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleStudentLinkChange: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleGuardianChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  genderOptions: Option[];
  classOptions: Option[];
  classArms: Option[];
  religionOptions: Option[];
  countryOptions: Option[];
  titleOptions: Option[];
  martianOptions: Option[];
  relationshipOptions: Option[];
}

export type StudentProviderProps = {
  children: React.ReactNode;
};
