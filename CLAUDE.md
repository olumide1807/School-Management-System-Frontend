# CLAUDE.md — School Management System (Frontend)

React + Vite + TypeScript dashboard for a multi-tenant school management
system aimed at Nigerian schools. The Express/Mongoose API lives in a
**separate repo** (`School-Management-System-Backend`, usually a sibling
folder on disk), served on **port 5002**.

- Run: `npm run dev` · Build: `npm run build`
- API base URL: `src/Utils/apiRoute.ts` ← `.env` (`.env` is gitignored;
  `.env.example` is committed)
- Stack: MUI v5 + Tailwind (both, see below), React Query v5, Redux Toolkit +
  redux-persist, React Router v6, react-hook-form, react-toastify

---

## 1. Two styling systems, on purpose

MUI and Tailwind are both in use and neither is being migrated away.

- **MUI** for interactive controls: `Button`, modals, date pickers,
  autocomplete, data grid.
- **Tailwind** for layout, spacing and typography.

Theme colors are defined in `src/theme.ts` and mirrored in
`tailwind.config.js` — `tertiary` is the brand accent and appears in both.
When adding a color, add it to both or it will look right in one place and
wrong in the other.

---

## 2. Auth and roles

### Login
`src/Pages/Auth/Login.tsx` has three tabs: **Staff / Parent / Student**.
They hit different endpoints — students authenticate with their **student ID**,
parents and staff with email.

`src/redux/apiCall.ts` holds `AccountType` and `finishLogin`, which is the
single place a successful login writes token + user into Redux. Route new
login flows through it rather than dispatching by hand.

The token lives in `sessionStorage`. `src/Utils/server.ts` (the axios instance,
exported as `SERVER`) attaches it and **decodes the expiry on every request** —
on an expired token it dispatches `logout()` and hard-redirects to `/login`.

### Roles
`src/hooks/usePermissions.ts` derives booleans from `state.user.role`:
`isSuperAdmin`, `isAdmin`, `isTeacher` (= `"academic"`), `isNonAcademic`, plus
`canAccess*` / `can*` flags.

**It only models staff roles.** `Role` is
`"super admin" | "admin" | "academic" | "non-academic"` — students and parents
are *not* in it. Those are handled by switching on `role` directly in
`src/Templates/DashboardLayout/index.tsx`. If you add a student/parent
capability check, don't expect `usePermissions` to cover it.

### Sidebar
`src/Templates/DashboardLayout/widgets/MenuLink.tsx` exports
`AdminMenuLinks`, `TeacherMenuLinks`, `StaffMenuLinks`, `StudentMenuLinks`,
`ParentMenuLinks` and `getMenuLinks(role, isAcademic)`. Items are typed as
`MenuItem`.

`DashboardLayout/index.tsx` switches on role to pick the home component.
Use `location.pathname` for active-link state — an earlier version captured an
`APP_URL` constant at render time, so the highlight never moved.

---

## 3. Data fetching

React Query v5 throughout. `SERVER` (axios) for the actual calls.

**Query keys are the biggest footgun in this codebase.** The opening crash of
one working session was two components using the same key for two different
response shapes — one returned an array, the other an object, and whichever
mounted second read the cached value of the first.

Rules:
- A key identifies a *shape*, not a topic. Same key ⇒ same endpoint ⇒ same
  shape, everywhere.
- Include every parameter in the key: `["class-students", activeArmId]`.
- Guard anyway. `Array.isArray(x) ? x : []` costs nothing and turns a white
  screen into an empty table.

Responses are usually `res.data.data` (the backend's `successResponse` wraps
once, axios wraps again), so `const rows = data?.data || []` is the common
shape. Some older hooks go one deeper: `levelsData?.data?.data?.data`.

Shared hooks: `src/hooks/useMyClasses.ts` (arms where the user is form
teacher), `src/hooks/useMySubjects.ts` (subjects they teach). A teacher may
have one, both, or neither — **"my class" and "my subjects" are different
things** and the sidebar reflects that.

---

## 4. Grading, results, report cards

- `src/Pages/Dashboard/Grading.tsx` — score entry. Columns come from the class
  level's **assessment format** (`/assessment`), which must total 100. A column
  with `source: "attendance"` is **read-only** and computed by the backend from
  the register; never render it as an input.
- `src/Pages/Dashboard/Results/index.tsx` + `ReportCard.tsx` — class results,
  positions, comments, printing.
- Positions, totals and averages all come from the backend
  (`utils/buildClassReport.js`). **Don't recompute them client-side.** The
  student/parent portal reads the same builder, and the two views disagreeing
  about a child's position is the kind of bug a school never forgives.
- Results are hidden from families until published. Publication is keyed on
  `{ classArm, term, session }`; the staff UI toggles it.

### Printing
`src/index.css` holds the print rules:

```css
@media print {
  @page { margin: 12mm; }
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .report-page { break-after: page; }
}
```

The print area is rendered through
`createPortal(..., document.body)`. This is **required**, not stylistic: any
ancestor with `overflow` clips an absolutely-positioned print area, and Chrome
prints only the header. If printing suddenly shows one page of nothing, check
that the portal is still there.

---

## 5. Student and parent portals

- `src/Pages/Dashboard/Student/` — `index.tsx` (home), `Results.tsx`,
  `Attendance.tsx`, `Profile.tsx`
- `src/Pages/Dashboard/Parent/index.tsx`
- `src/Pages/Auth/ChangePassword.tsx` — both students and parents land here on
  first login (`mustChangePassword`)

The attendance view shows **every day in the term**, with days not yet reached
left blank/white rather than hidden — a student should be able to see the shape
of the term, not just the days they missed.

Attendance percentage must be computed the same way on the dashboard tile and
the attendance page. They disagreed once (67% vs 100%) because one counted
auto-marked days and the other didn't. Auto-marked days are the backend's
business — take the number the API gives you rather than deriving a second one.

**Still to build:** parent child pages — `/child/:id/results`,
`/child/:id/attendance`, `/child/:id/profile`. Each needs a parent-scoped
backend endpoint that verifies the child's `guardians` include the requesting
parent before returning anything.

---

## 6. Shared components — check props before using them

Several form components are untyped (`}: any) => {`,
`forwardRef<any, any>(...)`). `Components/Forms/Input.tsx` and
`InputField.tsx` in particular have **no prop types at all**, so TypeScript
will not catch a wrong prop name — it just silently does nothing.

Read the component before calling it. Guessing has cost us twice.

---

## 7. Dead scaffolding — do not treat as reference

These are from the original template and contain hardcoded demo data
(`Array(5).fill("")`, "James Mujeeb", `console.log`s). They are not wired to
anything real:

- `Pages/Dashboard/StudentManagement/Modals/ViewResult.tsx`
- `Pages/Dashboard/StudentManagement/Modals/UploadStudentResult.tsx`
- `.../Academics/tabs/tab2/ClassLevel.tsx`
- `.../Academics/tabs/otherTabs/StudentTab.tsx`
- `.../Academics/Modals/AssignTeacherModal.tsx` *(partially rewritten — check
  before copying)*

Also: `rename_jsx_to_tsx.py` and `note.txt` at the repo root are leftovers.

---

## 8. Known rough edges

- **`_cacache/` is committed to the repo** — an npm cache folder, thousands of
  files, tracked in git. It should be `git rm -r --cached _cacache` plus a
  `.gitignore` entry. (The Claude project sync already filters it out.)
- The **Academics** page has 7 tabs and overflows; it currently needs
  `overflow-x-auto` and really needs regrouping.
- `AppSettings/index.tsx` is ~50KB and contains an editor for
  `schoolSettings.gradingScale`, which **nothing reads**. Grades come from the
  grade model.
- Timetable clash detection is not implemented (no builder guard, no dashboard
  warning). Deliberately deferred.
- Report card branding (logo, motto) and PDF export are deferred. Note the
  distinction we settled on: generating a PDF is not the same as letting a
  school customise its report layout, and the layout should be configurable
  data rather than a template engine.

---

## 9. Conventions

- Toasts: `react-toastify` with the shared `toastOptions` from
  `src/Utils/toastOptions.ts`.
- Empty states are first-class. Say what's missing and who fixes it ("You'll
  see your students here once your school administrator makes you the form
  teacher of a class"), not "No data".
- **Never put a destructive action next to the primary one.** "Discard
  changes" sits away from "Save"; there is no clear-all beside a submit button.
- Loading: `Pages/loaders/Loader.tsx`, `LoaderOverlay.tsx`.
- Tables: `Components/Tables/BasicTable.tsx` takes `headcells` + `tableData`,
  where a cell can be a React node (that's how action buttons are added).
