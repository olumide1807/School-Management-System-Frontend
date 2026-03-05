import { InfoTab, InfoTab2 } from "./OtherInfoTab";
import { StaffData } from "./StaffDataTab";

export const staff = {
  title: "Mr.",
  firstName: "John",
  surname: "Doe",
  otherName: "Michael",
  gender: "Male",
  staffID: "12345",
  emailAddress: "john.doe@example.com",
  phoneNumber: "9011593490",
  maritalStatus: "Married",
  minimumQualification: "Bachelor's Degree",
  staffType: "Teacher",
  salaryWithCurrency: "$400",
  employmentDate: "01/01/2023",
  assignedClassesAndSubjects: [
    {
      class: "Grade 1",
      subject: "Mathematics",
    },
    {
      class: "Grade 2",
      subject: "Science",
    },
  ],
  country: "Republic of Basitech",
  stateOfOrigin: "BAcity",
  localGovernmentArea: "Alimosho",
  religion: "Muslim",
  nextOfKin: {
    firstName: "Jane",
    surname: "Doe",
    phoneNumber: "9011593490",
    relationship: "Wife",
  },
  homeAddress: "123 Main Street, CityName, CountryName",
};
export default function ReviewTab({}) {
  return (
    <div>
      <main>
        <section className="flex justify-center items-center mt-4 mb-5">
          <div className="w-32 bg-black p-[0.4px]"></div>
          <div className="mx-3">Staff Data</div>
          <div className="w-32 bg-black p-[0.4px]"></div>
        </section>
        <section>
          {/* Staff picture */}
          <figure className="border-2 w-[220px] h-[128px] rounded-lg my-5">
            <img
              className="w-full h-full rounded-lg"
              src="/src/assets/images/defaultBg.png"
              alt="staff picture"
            />
          </figure>
        </section>
        <StaffData staff={staff} />
        <section className="flex justify-center items-center mt-5 mb-4">
          <div className="w-32 bg-black p-[0.4px]"></div>
          <div className="mx-3">Other Information</div>
          <div className="w-32 bg-black p-[0.4px]"></div>
        </section>
        <InfoTab staff={staff} />
        <InfoTab2 staff={staff} />
      </main>
    </div>
  );
}
