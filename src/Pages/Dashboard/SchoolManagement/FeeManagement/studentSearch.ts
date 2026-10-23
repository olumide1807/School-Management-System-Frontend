// Finding a student from what a bursar is holding: usually a bank
// narration like "QM/9016 ABDULBASIT ALA" — the student ID the parent was
// asked to quote, then the name, often cut short by the bank.
//
// Every word typed must match the start of, or sit inside, the student's
// ID or one of their names. Case and punctuation are ignored, so
// "QM9016", "qm-9016" and "QM/9016" all find QM/9016. An exact ID match
// sorts first, because siblings share a surname and the ID is what tells
// them apart.

const compact = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const words = (student: any): string[] =>
  [student.studentID, student.firstName, student.surName, student.otherName]
    .filter(Boolean)
    .flatMap((v: string) => [compact(v), ...String(v).split(/[\s/-]+/).map(compact)])
    .filter(Boolean);

export const studentLabel = (s: any) =>
  `${[s.firstName, s.otherName, s.surName].filter(Boolean).join(" ")} (${s.studentID})`;

export const matchStudents = (students: any[], query: string): any[] => {
  const terms = query.split(/\s+/).map(compact).filter(Boolean);
  if (terms.length === 0) return students;
  const hits = students.filter((s) => {
    const w = words(s);
    return terms.every((t) => w.some((x) => x.includes(t)));
  });
  // Exact ID first, then ID prefix, then everything else in name order
  const idOf = (s: any) => compact(s.studentID);
  const first = terms[0];
  const rank = (s: any) => (idOf(s) === first ? 0 : idOf(s).startsWith(first) ? 1 : 2);
  return hits.sort((a, b) => rank(a) - rank(b) || studentLabel(a).localeCompare(studentLabel(b)));
};
