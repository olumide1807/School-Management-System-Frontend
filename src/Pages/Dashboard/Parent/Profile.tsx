import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import { Row } from "../Student/ProfileView";

// The same address object students have. Parents created before the
// backend stored it have none, and show "—".
const formatAddress = (parent: any): string | null => {
  const a = parent.address;
  if (!a || typeof a !== "object") return null;
  const line = [[a.number, a.street].filter(Boolean).join(" "), a.city, a.state, a.country]
    .filter(Boolean)
    .join(", ");
  return line || null;
};

// The parent's own details. Read-only: there's no self-service route for a
// parent to change these yet, and PUT /parent/:id is admin-only.
export default function ParentProfile() {
  const navigate = useNavigate();

  // Same endpoint and shape as the parent dashboard, so the same key
  const { data, isPending, isError } = useQuery({
    queryKey: ["parent-portal-home"],
    queryFn: async () => {
      const res = await SERVER.get("portal/parent/me");
      return res?.data?.data;
    },
    retry: false,
  });

  if (isPending) return <Loader />;

  if (isError || !data?.parent) {
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

  const { parent } = data;
  const children: any[] = Array.isArray(data.children) ? data.children : [];
  const fullName = [parent.title, parent.firstName, parent.surName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-6 max-w-[760px]">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-5 border border-[#DEE0E0] rounded-[12px] p-5">
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: "#CCE9F4",
            color: "#0E7094",
            fontSize: 24,
          }}
        >
          {parent.firstName?.[0]}
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-secondary">{fullName}</h1>
          <p className="text-sm text-text-ter mt-0.5">{parent.email}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Details */}
        <section className="w-full lg:flex-1 border border-[#DEE0E0] rounded-[12px] p-5">
          <h2 className="text-base font-semibold text-secondary mb-2">
            Your details
          </h2>
          <Row label="Full name" value={fullName} />
          <Row label="Email" value={parent.email} />
          <Row label="Phone" value={parent.phoneNumber} />
          <Row label="Occupation" value={parent.occupation} />
          <Row label="Address" value={formatAddress(parent)} />
        </section>

        {/* Children */}
        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-6">
          <div className="border border-[#DEE0E0] rounded-[12px] p-5">
            <h2 className="text-base font-semibold text-secondary mb-2">
              Your children
            </h2>
            {children.length === 0 ? (
              <p className="text-sm text-text-ter py-3 leading-relaxed">
                No children are linked to your account yet. The school office
                links them.
              </p>
            ) : (
              <ul>
                {children.map((child) => {
                  const name = [child.firstName, child.surName]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <li
                      key={child._id}
                      className="border-b border-[#EFF5F8] last:border-b-0"
                    >
                      <button
                        onClick={() => navigate(`/child/${child._id}/profile`)}
                        className="w-full flex items-center gap-3 py-3 text-left hover:text-tertiary transition-colors"
                      >
                        <Avatar
                          src={child.photo || undefined}
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "#CCE9F4",
                            color: "#0E7094",
                            fontSize: 15,
                          }}
                        >
                          {child.firstName?.[0]}
                        </Avatar>
                        <span className="min-w-0">
                          <span className="block text-sm text-text-pry">
                            {name}
                          </span>
                          <span className="block text-xs text-text-ter mt-0.5">
                            {[child.classLabel, child.relationship]
                              .filter(Boolean)
                              .join(" · ") || child.studentID}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <div className="rounded-[10px] bg-bg-7 px-5 py-4">
        <p className="text-[13px] text-gray-1 leading-relaxed">
          Something here wrong or out of date? Tell the school office.
          You can&apos;t change these details yourself.
        </p>
      </div>
    </div>
  );
}
