// The school calendar for families — one component for the student and
// parent portals, rendering GET /portal/calendar as it comes.
//
// Each entry either closes the school (a holiday, a break) or is something
// happening at school on an ordinary school day (a sports day). That's the
// entry's closesSchool flag, never its type — the same flag the register
// and the auto-marker go by — and each row says which it is.
//
// Leads with what people open it for — when the term ends and the next
// day off — then the term's entries in date order. Past ones are listed
// last and dimmed.

const TYPE_LABELS: Record<string, string> = {
  public_holiday: "Public holiday",
  school_break: "School break",
  school_event: "School event",
};

// Missing means closed, as it does on the server
const closesSchool = (e: any) => e?.closesSchool !== false;

const typeLabel = (e: any) => TYPE_LABELS[e.type] || (closesSchool(e) ? "Closure" : "Event");

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
  const closed = closesSchool(e);
  return (
    <li className={`flex flex-wrap items-baseline justify-between gap-2 py-3 border-b border-[#EFF5F8] last:border-b-0 ${past ? "opacity-60" : ""}`}>
      <span className="min-w-0">
        <span className="block text-sm text-text-pry">{e.name}</span>
        <span className="block text-xs text-text-ter mt-0.5">
          {range(e)} · {closed ? "No school" : "School is open as usual"}
        </span>
      </span>
      <span className="flex gap-1.5">
        <span className="text-xs px-2 py-0.5 rounded-[6px] bg-bg-7 text-text-sec">{typeLabel(e)}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-[6px] ${
            closed ? "bg-[#FDF1E7] text-[#8A4B0F]" : "bg-[#E7F4F9] text-[#0E7094]"
          }`}
        >
          {closed ? "Day off" : "At school"}
        </span>
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

  // What's next. Only entries that close the school are days off; the rest
  // are things happening at school and never count as one.
  const covering = (e: any) => dayOf(e.startDate) <= today && today <= dayOf(e.endDate);
  const closures = entries.filter(closesSchool);
  const events = entries.filter((e) => !closesSchool(e));
  const ongoing = closures.find(covering);
  const nextClosure = closures.find((e) => dayOf(e.startDate) > today) || null;
  // The next thing on at school (today's, else the next one)
  const nextEvent = events.find(covering) || events.find((e) => dayOf(e.startDate) > today) || null;
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
          <p className="text-sm text-text-pry">No more days off this session.</p>
        ) : null}

        {data?.calendarSetUp !== false && nextEvent && (
          <div>
            <p className="text-[13px] text-gray-1">On at school · school is open</p>
            <p className="text-sm font-medium text-text-pry">{nextEvent.name}</p>
            <p className="text-sm text-text-ter">
              {covering(nextEvent)
                ? dayOf(nextEvent.startDate) === dayOf(nextEvent.endDate)
                  ? "Today"
                  : `Until ${fmt(nextEvent.endDate)}`
                : `${range(nextEvent)} · ${inDays(daysBetween(today, dayOf(nextEvent.startDate)))}`}
            </p>
          </div>
        )}

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
            The school hasn&apos;t set up its calendar yet, so no holidays or events are
            listed. They&apos;ll appear here once it has.
          </p>
        </section>
      ) : entries.length === 0 ? (
        <section className="border border-[#DEE0E0] rounded-[12px] p-5">
          <p className="text-sm text-text-pry leading-relaxed">
            No holidays or events are recorded for {session?.sessionName || "this session"}.
            The school office can confirm if you&apos;re expecting one.
          </p>
        </section>
      ) : (
        <>
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
