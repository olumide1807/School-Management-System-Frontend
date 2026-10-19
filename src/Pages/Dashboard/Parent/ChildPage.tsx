import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "@mui/material";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";

// The backend answers 404 for every "no" on a child route — malformed id,
// another school, another family — so 404 here means "not your child".
export const isNotFound = (error: any) => error?.response?.status === 404;

// Deliberately says nothing about whether such a child exists.
export function ChildNotFound() {
  const navigate = useNavigate();
  return (
    <div className="max-w-[520px] py-12">
      <h1 className="text-xl font-semibold text-secondary">
        We couldn&apos;t find that child
      </h1>
      <p className="mt-2 text-sm text-gray-1 leading-relaxed">
        Go back to your children and choose one from there.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-5 px-4 py-2 rounded-[8px] text-sm text-white bg-tertiary hover:bg-secondary transition-colors"
      >
        My children
      </button>
    </div>
  );
}

export const firstNameOf = (child: any) => child?.firstName || "your child";

const SECTIONS = [
  { key: "results", label: "Results" },
  { key: "attendance", label: "Attendance" },
  { key: "profile", label: "Details" },
] as const;

// Frame for every /child/:childId/* page: loads the child (which is also
// the guardianship check), shows whose page this is — a parent with
// several children must always know which one they're looking at — and
// hands the loaded child to the page body.
export default function ChildPage({
  children,
}: {
  children: (child: { childId: string; profile: any }) => ReactNode;
}) {
  const { childId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["child-profile", childId],
    queryFn: async () => {
      const res = await SERVER.get(`portal/child/${childId}/profile`);
      return res?.data?.data;
    },
    enabled: !!childId,
    retry: false,
  });

  if (!childId) return <ChildNotFound />;
  if (isPending) return <Loader />;
  if (isNotFound(error)) return <ChildNotFound />;

  if (isError || !data) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">
          Couldn&apos;t load this page
        </h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let the school know if this keeps happening.
        </p>
      </div>
    );
  }

  const { child, classArm } = data;
  const fullName = [child.firstName, child.otherName, child.surName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-6">
      {/* Whose page this is */}
      <div className="flex flex-col gap-4 print:hidden">
        <button
          onClick={() => navigate("/")}
          className="self-start text-[13px] text-text-ter hover:text-tertiary transition-colors"
        >
          ← My children
        </button>

        <div className="flex flex-wrap items-center gap-4">
          <Avatar
            src={child.photo || undefined}
            sx={{ width: 52, height: 52, bgcolor: "#CCE9F4", color: "#0E7094" }}
          >
            {child.firstName?.[0]}
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-[22px] leading-tight font-bold text-secondary">
              {fullName}
            </h1>
            <p className="text-sm text-text-ter mt-0.5 tabular-nums">
              {child.studentID}
              {classArm?.label && ` · ${classArm.label}`}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => {
            const path = `/child/${childId}/${s.key}`;
            const active = location.pathname === path;
            return (
              <button
                key={s.key}
                onClick={() => navigate(path)}
                className={`px-4 py-2 rounded-[8px] text-sm transition-colors ${
                  active
                    ? "text-white bg-tertiary"
                    : "text-text-sec border border-[#DEE0E0] hover:border-tertiary"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </nav>
      </div>

      {children({ childId, profile: data })}
    </div>
  );
}
