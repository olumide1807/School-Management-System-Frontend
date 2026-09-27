import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";

export default function ParentDashboard() {
  const navigate = useNavigate();

  const { data, isPending, isError } = useQuery({
    queryKey: ["parent-portal-home"],
    queryFn: async () => {
      const res = await SERVER.get("portal/parent/me");
      return res?.data?.data;
    },
    retry: false,
  });

  if (isPending) return <Loader />;

  if (isError || !data) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">
          Couldn&apos;t load your details
        </h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let the school know if this keeps happening.
        </p>
      </div>
    );
  }

  const { parent, children, term, session, announcements } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] leading-tight font-bold text-secondary tracking-[-0.01em]">
          Hello, {parent.firstName}
        </h1>
        <p className="mt-1 text-sm text-text-ter">
          {term?.termName && session?.sessionName
            ? `${term.termName}, ${session.sessionName}`
            : "Your children"}
        </p>
      </div>

      {children.length === 0 ? (
        <div className="max-w-[520px] border border-[#DEE0E0] rounded-[12px] p-6">
          <p className="text-[15px] text-text-pry">No children linked yet</p>
          <p className="mt-2 text-sm text-gray-1 leading-relaxed">
            Your child&apos;s school links their record to your account. Contact
            the school office if you think this is wrong.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Children */}
          <section className="w-full lg:flex-1 flex flex-col gap-4">
            {children.map((child: any) => {
              const name =
                `${child.firstName || ""} ${child.surName || ""}`.trim();
              return (
                <div
                  key={child._id}
                  className="border border-[#DEE0E0] rounded-[12px] p-5"
                >
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Avatar
                      src={child.photo || undefined}
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: "#CCE9F4",
                        color: "#0E7094",
                      }}
                    >
                      {child.firstName?.[0]}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-secondary">
                        {name}
                      </p>
                      <p className="text-xs text-text-ter mt-0.5 tabular-nums">
                        {child.studentID}
                        {child.classLabel && ` · ${child.classLabel}`}
                        {child.relationship &&
                          ` · your ${child.relationship.toLowerCase()}`}
                      </p>
                    </div>
                    {child.resultsPublished && (
                      <span className="text-xs px-3 py-1.5 rounded-[8px] bg-[#EAF3DE] text-[#3B6D11]">
                        Result ready
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-4">
                    <div>
                      <p className="text-xs text-text-ter">
                        Attendance this term
                      </p>
                      <p className="text-lg font-semibold text-text-pry tabular-nums">
                        {child.attendance.percentage === null
                          ? "—"
                          : `${child.attendance.percentage}%`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-ter">Days present</p>
                      <p className="text-lg font-semibold text-text-pry tabular-nums">
                        {child.attendance.present}
                        <span className="text-sm text-text-ter font-normal">
                          {" "}
                          of {child.attendance.total}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/child/${child._id}/results`)}
                      className={`px-4 py-2 rounded-[8px] text-sm transition-colors ${
                        child.resultsPublished
                          ? "text-white bg-tertiary hover:bg-secondary"
                          : "text-text-sec border border-[#DEE0E0]"
                      }`}
                    >
                      Results
                    </button>
                    <button
                      onClick={() => navigate(`/child/${child._id}/attendance`)}
                      className="px-4 py-2 rounded-[8px] text-sm text-text-sec border border-[#DEE0E0] hover:border-tertiary transition-colors"
                    >
                      Attendance
                    </button>
                    <button
                      onClick={() => navigate(`/child/${child._id}/profile`)}
                      className="px-4 py-2 rounded-[8px] text-sm text-text-sec border border-[#DEE0E0] hover:border-tertiary transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Rail */}
          <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6">
            <div className="border border-[#DEE0E0] rounded-[12px] p-5">
              <h2 className="text-[13px] font-semibold text-secondary mb-3">
                From the school
              </h2>
              {announcements.length === 0 ? (
                <p className="text-sm text-text-ter">
                  No announcements right now.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {announcements.map((a: any) => (
                    <li
                      key={a._id}
                      className="border-b border-[#EFF5F8] last:border-b-0 pb-3 last:pb-0"
                    >
                      <p className="text-sm text-text-pry">{a.title}</p>
                      {a.description && (
                        <p className="text-xs text-text-ter mt-0.5 line-clamp-2">
                          {a.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
