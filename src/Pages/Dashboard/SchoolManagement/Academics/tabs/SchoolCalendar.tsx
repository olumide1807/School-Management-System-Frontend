import { useState } from "react";
import Button from "@mui/material/Button";
import { Add, Edit, DeleteOutline, Flag } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import Modal from "../../../../../Components/Modals";
import SERVER from "../../../../../Utils/server";
import { toastOptions } from "../../../../../Utils/toastOptions";
import { useSessionTerm } from "../../../../../services/api-call";
import Loader from "../../../../loaders/Loader";

const TYPE_LABELS: Record<string, string> = {
  public_holiday: "Public holiday",
  school_break: "School break",
  school_event: "School event",
  other: "Other",
};

const TYPE_STYLES: Record<string, string> = {
  public_holiday: "bg-[#E6F1FB] text-[#185FA5]",
  school_break: "bg-[#EAF3DE] text-[#3B6D11]",
  school_event: "bg-[#FAEEDA] text-[#854F0B]",
  other: "bg-gray-100 text-gray-600",
};

// Dates come back as UTC day-starts; format them in UTC so a
// 1 October entry never renders as 30 September in a western timezone
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });

const rangeLabel = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (s === e) return fmt(start, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  return `${fmt(start, { day: "numeric", month: "short" })} – ${fmt(end, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

const dayCount = (start: string, end: string) =>
  Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;

const toInputDate = (iso: string) => new Date(iso).toISOString().split("T")[0];

type Form = { name: string; type: string; startDate: string; endDate: string };
const emptyForm: Form = { name: "", type: "public_holiday", startDate: "", endDate: "" };

export default function SchoolCalendar() {
  const queryClient = useQueryClient();

  const session = useSessionTerm();
  const activeSession = session?.data?.data?.data?.session;

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["school-calendar"],
    queryFn: async () => {
      const res = await SERVER.get("calendar");
      return res?.data;
    },
    retry: false,
  });
  const entries = data?.data || [];

  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  const upcoming = entries.filter((e: any) => new Date(e.endDate) >= todayUTC);
  const past = entries.filter((e: any) => new Date(e.endDate) < todayUTC).reverse();

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["school-calendar"] });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const openEdit = (entry: any) => {
    setEditingId(entry._id);
    setForm({
      name: entry.name,
      type: entry.type,
      startDate: toInputDate(entry.startDate),
      endDate: toInputDate(entry.endDate),
    });
    setOpenModal(true);
  };

  const close = () => {
    setOpenModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Give it a name", toastOptions);
    if (!form.startDate) return toast.error("Choose a date", toastOptions);
    const endDate = form.endDate || form.startDate;
    if (endDate < form.startDate)
      return toast.error("End date can't be before start date", toastOptions);

    setSaving(true);
    try {
      const payload = { ...form, endDate };
      if (editingId) await SERVER.put(`calendar/${editingId}`, payload);
      else await SERVER.post("calendar", payload);
      toast.success(editingId ? "Updated" : "Added to the calendar", toastOptions);
      await refresh();
      close();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Could not save", toastOptions);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: any) => {
    if (!window.confirm(`Remove "${entry.name}" from the calendar? It will count as a school day again.`))
      return;
    try {
      await SERVER.delete(`calendar/${entry._id}`);
      toast.success("Removed", toastOptions);
      await refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Could not remove", toastOptions);
    }
  };

  const seedHolidays = async () => {
    if (!activeSession?._id) return toast.error("No active session", toastOptions);
    setSeeding(true);
    try {
      const res = await SERVER.post("calendar/public-holidays", { sessionId: activeSession._id });
      toast.success(res?.data?.message || "Done", toastOptions);
      await refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Could not add holidays", toastOptions);
    } finally {
      setSeeding(false);
    }
  };

  const EntryRow = ({ entry, muted }: { entry: any; muted?: boolean }) => {
    const days = dayCount(entry.startDate, entry.endDate);
    return (
      <div
        className={`flex flex-wrap items-center gap-3 px-5 py-3.5 border-t border-gray-100 first:border-t-0 ${
          muted ? "opacity-60" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-black">{entry.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {rangeLabel(entry.startDate, entry.endDate)}
            {days > 1 && ` · ${days} days`}
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-md ${TYPE_STYLES[entry.type] || TYPE_STYLES.other}`}>
          {TYPE_LABELS[entry.type] || "Other"}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => openEdit(entry)}
            className="p-1.5 rounded-md text-gray-500 hover:text-tertiary hover:bg-gray-50"
            aria-label={`Edit ${entry.name}`}
          >
            <Edit sx={{ fontSize: 18 }} />
          </button>
          <button
            onClick={() => remove(entry)}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50"
            aria-label={`Remove ${entry.name}`}
          >
            <DeleteOutline sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    );
  };

  if (isPending) return <Loader />;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[620px]">
            <h2 className="text-lg font-semibold text-black">School Calendar</h2>
            <p className="text-sm text-gray-500 mt-1">
              Days the school is closed during term. Attendance can't be marked on
              these days, and they won't count against any student's attendance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outlined"
              startIcon={<Flag />}
              onClick={seedHolidays}
              disabled={seeding || !activeSession?._id}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              {seeding ? "Adding…" : "Add fixed public holidays"}
            </Button>
            <Button
              color="tertiary"
              variant="contained"
              startIcon={<Add />}
              onClick={openAdd}
              sx={{ borderRadius: "8px", textTransform: "none", color: "white" }}
            >
              Add closure
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-[#F5F8F9] px-4 py-3 text-xs text-gray-600 leading-relaxed">
          "Add fixed public holidays" covers New Year's Day, Workers' Day, Democracy Day,
          Independence Day, Christmas and Boxing Day, for dates inside this session's terms.
          Add Good Friday, Easter Monday, the Eids and Maulud yourself once the Federal
          Government announces them — along with any Monday declared in place of a weekend holiday.
        </div>

        <div>
          <h3 className="text-sm font-semibold text-black mb-2">Upcoming</h3>
          {upcoming.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-xl">
              <p className="text-gray-500 text-sm">
                Nothing on the calendar yet. Every weekday in term counts as a school day.
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {upcoming.map((e: any) => (
                <EntryRow key={e._id} entry={e} />
              ))}
            </div>
          )}
        </div>

        {past.length > 0 && (
          <div>
            <button
              onClick={() => setShowPast((v) => !v)}
              className="text-sm text-tertiary mb-2"
            >
              {showPast ? "Hide" : "Show"} past closures ({past.length})
            </button>
            {showPast && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {past.map((e: any) => (
                  <EntryRow key={e._id} entry={e} muted />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        openModal={openModal}
        closeModal={close}
        title={editingId ? "Edit closure" : "Add closure"}
        maxWidth="520px"
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-700">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Eid al-Fitr, Mid-term break, Inter-house sports"
              className="border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-700">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">From</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    startDate: e.target.value,
                    endDate: form.endDate && form.endDate >= e.target.value ? form.endDate : e.target.value,
                  })
                }
                className="border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">To</span>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 -mt-2">For a single day, leave "To" the same as "From".</p>

          <Button
            color="tertiary"
            variant="contained"
            onClick={save}
            disabled={saving}
            sx={{
              color: "white",
              borderRadius: "10px",
              paddingY: "12px",
              width: "fit-content",
              textTransform: "none",
            }}
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add to calendar"}
          </Button>
        </div>
      </Modal>
    </>
  );
}