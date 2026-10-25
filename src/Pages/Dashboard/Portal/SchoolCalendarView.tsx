// The school calendar for families — one component for the student and
// parent portals, rendering GET /portal/calendar as it comes.
//
// Every entry on the school calendar is a day with no school: the
// attendance register and the auto-marker treat every entry as a closure,
// whatever its type, so this page says so rather than implying some are
// ordinary school days.
//
// Leads with what people open it for — when the term ends and the next
// day off — then the term's closures in date order. Past ones are listed
// last and dimmed.

const TYPE_LABELS: Record<string, string> = {
  public_holiday: "Public holiday",
  school_break: "School break",
  school_event: "School event",
  other: "Closure",
};

// Dates are stored as UTC day-starts: compare and show them as calendar
// days, in UTC, so a day never shifts in a western timezone
const dayOf = (d: string | Date) => new Date(d).toISOString().slice(0, 10);
const todayDay = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};
const fmt = (d: string, withWeekday = true) =>
  new Date(d).toLocaleDateString("en-GB", {
    ...(withWeekday ? { weekday: "long" } : {}),
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
const daysBetween = (fromDay: string, toDay: string) =>
  Math.round((Date.parse(`${toDay}T00:00:00Z`) - Date.parse(`${fromDay}T00:00:00Z`)) / 86400000);
const inDays = (n: number) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);

const range = (e: any) =>
  dayOf(e.startDate) === dayOf(e.endDate)
    ? fmt(e.startDate)
    : `${fmt(e.startDate)} – ${fmt(e.endDate)}`;

function EntryRow({ e, past }: { e: any; past?: boolean }) {
  return (
    <li className={`flex flex-wrap items-baseline justify-between gap-2 py-3 border-b border-[#EFF5F8] last:border-b-0 ${past ? "opacity-60" : ""}`}>
      <span className="min-w-0">
        <span className="block text-sm text-text-pry">{e.name}</span>
        <span className="block text-xs text-text-ter mt-0.5">{range(e)}</span>
      </span>
      <span className="text-xs px-2 py-0.5 rounded-[6px] bg-bg-7 text-text-sec">
        {TYPE_LABELS[e.type] || "Closure"}
      </span>
    </li>
  );
}

export default function SchoolCalendarView({ data }: { data: any }) {
  const term = data?.term || null;
  const session = data?.session || null;
  const terms: any[] = Array.isArray(data?.terms) ? data.terms : [];
  const entries: any[] = Array.isArray(data?.entries) ? data.entries : [];
  const today = todayDay();

  const covers = [term?.termName, session?.sessionName].filter(Boolean).join(", ");

  // Nothing to place on a calendar at all
  if (!term && !session) {
    return (
      <div className="max-w-[640px] py-6">
        <h1 className="text-xl font-semibold text-secondary">School calendar</h1>
        <p className="mt-2 text-sm text-gray-1 leading-relaxed">
          The school hasn&apos;t set up the current term yet, so there are no dates to show.
        </p>
      </div>
    );
  }

  // What's next
  const ongoing = entries.find((e) => dayOf(e.startDate) <= today && today <= dayOf(e.endDate));
  const upcoming = entries.filter((e) => dayOf(e.startDate) > today);
  const nextClosure = upcoming[0] || null;
  const nextTerm = terms.find((t) => t.startDate && dayOf(t.startDate) > today && !t.isCurrent) || null;
  const termEndDay = term?.endDate ? dayOf(term.endDate) : null;

  // Group the rest: this term (current or upcoming), later in the session, earlier
  const inTerm = (e: any) =>
    term?.startDate && term?.endDate &&
    dayOf(e.endDate) >= dayOf(term.startDate) && dayOf(e.startDate) <= dayOf(term.endDate);
  const notPast = entries.filter((e) => dayOf(e.endDate) >= today);
  const thisTerm = notPast.filter(inTerm);
  const later = notPast.filter((e) => !inTerm(e));
  const past = entries.filter((e) => dayOf(e.endDate) < today);

  return (
    <div className="flex flex-col gap-6 max-w-[760px]">
      <div>
        <h1 className="text-xl font-semibold text-secondary">School calendar</h1>
        {covers && <p className="text-sm text-text-ter mt-0.5">{covers}</p>}
      </div>

      {/* ---- Coming up ---- */}
      <section className="border border-[#DEE0E0] rounded-[12px] p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-secondary">Coming up</h2>

        {term && (
          <div>
            <p className="text-[13px] text-gray-1">{term.termName} ends</p>
            {termEndDay ? (
              <p className="text-lg font-semibold text-text-pry">
                {fmt(term.endDate)}
                <span className="text-sm font-normal text-text-ter"> · {inDays(daysBetween(today, termEndDay))}</span>
              </p>
            ) : (
              <p className="text-sm text-text-pry">The school hasn&apos;t set this term&apos;s dates yet.</p>
            )}
          </div>
        )}

        {data?.calendarSetUp === false ? null : ongoing ? (
          <div>
            <p className="text-[13px] text-gray-1">No school now</p>
            <p className="text-lg font-semibold text-text-pry">{ongoing.name}</p>
            <p className="text-sm text-text-ter">
              {dayOf(ongoing.startDate) === dayOf(ongoing.endDate)
                ? "Today"
                : `Until ${fmt(ongoing.endDate)}`}
            </p>
          </div>
        ) : nextClosure ? (
          <div>
            <p className="text-[13px] text-gray-1">Next day off</p>
            <p className="text-lg font-semibold text-text-pry">{nextClosure.name}</p>
            <p className="text-sm text-text-ter">
              {range(nextClosure)} · {inDays(daysBetween(today, dayOf(nextClosure.startDate)))}
            </p>
          </div>
        ) : entries.length > 0 ? (
          <p className="text-sm text-text-pry">No more holidays or closures this session.</p>
        ) : null}

        {nextTerm && (
          <div>
            <p className="text-[13px] text-gray-1">{nextTerm.termName} starts</p>
            <p className="text-sm text-text-pry">{fmt(nextTerm.startDate)}</p>
          </div>
        )}
      </section>

      {/* ---- The calendar itself ---- */}
      {data?.calendarSetUp === false ? (
        <section className="border border-[#DEE0E0] rounded-[12px] p-5">
          <p className="text-sm text-text-pry leading-relaxed">
            The school hasn&apos;t set up its calendar yet, so no holidays or closures are
            listed. They&apos;ll appear here once it has.
          </p>
        </section>
      ) : entries.length === 0 ? (
        <section className="border border-[#DEE0E0] rounded-[12px] p-5">
          <p className="text-sm text-text-pry leading-relaxed">
            No holidays or closures are recorded for {session?.sessionName || "this session"}.
            The school office can confirm if you&apos;re expecting one.
          </p>
        </section>
      ) : (
        <>
          <p className="text-[13px] text-gray-1 -mb-3">
            There&apos;s no school on any of the days below.
          </p>

          {thisTerm.length > 0 && (
            <section className="border border-[#DEE0E0] rounded-[12px] p-5">
              <h2 className="text-base font-semibold text-secondary mb-1">
                {term ? `Rest of ${term.termName}` : "Coming up"}
              </h2>
              <ul>{thisTerm.map((e) => <EntryRow key={e._id} e={e} />)}</ul>
            </section>
          )}

          {later.length > 0 && (
            <section className="border border-[#DEE0E0] rounded-[12px] p-5">
              <h2 className="text-base font-semibold text-secondary mb-1">Later this session</h2>
              <ul>{later.map((e) => <EntryRow key={e._id} e={e} />)}</ul>
            </section>
          )}

          {past.length > 0 && (
            <section className="border border-[#DEE0E0] rounded-[12px] p-5">
              <h2 className="text-base font-semibold text-text-ter mb-1">Earlier this session</h2>
              <ul>{past.map((e) => <EntryRow key={e._id} e={e} past />)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
