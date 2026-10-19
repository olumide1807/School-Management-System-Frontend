import { Avatar } from "@mui/material";

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "—";

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 py-3 border-b border-[#EFF5F8] last:border-b-0">
    <span className="text-[13px] text-text-ter">{label}</span>
    <span className="text-sm text-text-pry">{value || "—"}</span>
  </div>
);

// A student's details and class. Shared by the student's own profile and a
// parent's view of a child.
//
// childName set → copy is written to a parent about that child, the
// parent's relationship is shown, and the name header is left to the
// parent page (which already shows it); unset → written to the student.
export default function ProfileView({
  student,
  classArm,
  childName,
  relationship,
}: {
  student: any;
  classArm: any;
  childName?: string;
  relationship?: string | null;
}) {
  const fullName = [student.surName, student.firstName, student.otherName]
    .filter(Boolean)
    .join(" ");

  const gender =
    student.gender === "male"
      ? "Male"
      : student.gender === "female"
        ? "Female"
        : "—";

  const forParent = !!childName;

  return (
    <div className="flex flex-col gap-6 max-w-[760px]">
      {/* Header */}
      {!forParent && (
        <div className="flex flex-wrap items-center gap-5 border border-[#DEE0E0] rounded-[12px] p-5">
          <Avatar
            src={student.photo || undefined}
            sx={{
              width: 72,
              height: 72,
              bgcolor: "#CCE9F4",
              color: "#0E7094",
              fontSize: 24,
            }}
          >
            {student.firstName?.[0]}
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-secondary">{fullName}</h1>
            <p className="text-sm text-text-ter mt-0.5 tabular-nums">
              {student.studentID}
              {classArm?.label && ` · ${classArm.label}`}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Details */}
        <section className="w-full lg:flex-1 border border-[#DEE0E0] rounded-[12px] p-5">
          <h2 className="text-base font-semibold text-secondary mb-2">
            {forParent ? "Details" : "Your details"}
          </h2>
          <Row label="Full name" value={fullName} />
          <Row label="Student ID" value={student.studentID} />
          <Row label="Date of birth" value={fmtDate(student.dateOfBirth)} />
          <Row label="Gender" value={gender} />
          {student.admissionDate && (
            <Row label="Admitted" value={fmtDate(student.admissionDate)} />
          )}
          {forParent && (
            <Row label="Your relationship" value={relationship} />
          )}
        </section>

        {/* School and guardian */}
        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-6">
          <div className="border border-[#DEE0E0] rounded-[12px] p-5">
            <h2 className="text-base font-semibold text-secondary mb-2">
              {forParent ? "Class" : "Your class"}
            </h2>
            <Row label="Class" value={classArm?.label} />
            <Row label="Level" value={classArm?.levelName} />
            <Row label="Form teacher" value={classArm?.formTeacher} />
          </div>

          {student.emergencyContact?.name && (
            <div className="border border-[#DEE0E0] rounded-[12px] p-5">
              <h2 className="text-base font-semibold text-secondary mb-1">
                Who the school calls
              </h2>
              <p className="text-xs text-text-ter mb-2 leading-relaxed">
                {forParent
                  ? `If there's an emergency, this is who the school contacts about ${childName}.`
                  : "If there's an emergency, this is who your school contacts."}
              </p>
              <Row label="Name" value={student.emergencyContact.name} />
              <Row label="Phone" value={student.emergencyContact.phone} />
              <Row
                label="Relationship"
                value={student.emergencyContact.relationship}
              />
            </div>
          )}
        </aside>
      </div>

      <div className="rounded-[10px] bg-bg-7 px-5 py-4">
        <p className="text-[13px] text-gray-1 leading-relaxed">
          Something here wrong or out of date? Tell{" "}
          {classArm?.formTeacher ? (
            <span className="text-text-pry font-medium">
              {classArm.formTeacher}
            </span>
          ) : forParent ? (
            `${childName}'s form teacher`
          ) : (
            "your form teacher"
          )}{" "}
          or the school office.
          {forParent
            ? " Only the school can change these details."
            : " You can't change these details yourself."}
        </p>
      </div>
    </div>
  );
}
