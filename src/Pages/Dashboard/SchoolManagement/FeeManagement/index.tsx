import { useState, useEffect } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel, IconButton, Chip } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import Modal from "../../../../Components/Modals";
import MessageModal from "../../../../Components/Modals/MessageModal";
import TableComponent from "../../../../Components/Tables";
import { useClassArms, useClassLevels, useSessionTerm } from "../../../../services/api-call";
import SERVER from "../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../Utils/toastOptions";
import Loader from "../../../loaders/Loader";

const PLATFORM_FEE = { description: "Platform Fee (Basitech)", amount: "2000" };

export default function FeeManagement() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openSaveConfirm, setOpenSaveConfirm] = useState(false);
  const [openRecordPayment, setOpenRecordPayment] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [feeToDelete, setFeeToDelete] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedArmIds, setSelectedArmIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState("NGN");
  const [feeItems, setFeeItems] = useState([{ description: "", amount: "" }]);

  const [filterTermId, setFilterTermId] = useState("");

  const [paymentStudentId, setPaymentStudentId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentRef, setPaymentRef] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [openReceipt, setOpenReceipt] = useState(false);

  const queryClient = useQueryClient();
  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];

  const session = useSessionTerm();
  const activeSession = session?.data?.data?.data?.session;
  const activeTerm = session?.data?.data?.data?.term;

  const { data: termsData } = useQuery({
    queryKey: ['session-terms', activeSession?._id],
    queryFn: async () => {
      const res = await SERVER.get(`session/term/${activeSession._id}`);
      return res?.data?.data || [];
    },
    enabled: !!activeSession?._id,
  });
  const terms = termsData || [];

  // Auto-select current term, or most relevant term if on holiday
  useEffect(() => {
    if (terms.length > 0 && !filterTermId) {
      // Priority 1: use active term from session if available
      if (activeTerm?._id) {
        setFilterTermId(activeTerm._id);
        if (!selectedTermId) setSelectedTermId(activeTerm._id);
        return;
      }

      const parseDate = (d: any) => {
        if (!d) return null;
        const date = new Date(d);
        return isNaN(date.getTime()) ? null : date;
      };

      // Priority 2: find the term where today falls between start and end
      const now = new Date();
      const currentByDate = terms.find((t: any) => {
        const s = parseDate(t.termStartDate);
        const e = parseDate(t.termEndDate);
        return s && e && s <= now && e >= now;
      });
      if (currentByDate) {
        setFilterTermId(currentByDate._id);
        if (!selectedTermId) setSelectedTermId(currentByDate._id);
        return;
      }

      // Priority 3: find the most recently started term (today > start date)
      const startedTerms = terms
        .filter((t: any) => {
          const s = parseDate(t.termStartDate);
          return s && s <= now;
        })
        .sort((a: any, b: any) => {
          const sa = parseDate(a.termStartDate)?.getTime() || 0;
          const sb = parseDate(b.termStartDate)?.getTime() || 0;
          return sb - sa;
        });
      if (startedTerms.length > 0) {
        setFilterTermId(startedTerms[0]._id);
        if (!selectedTermId) setSelectedTermId(startedTerms[0]._id);
        return;
      }

      // Fallback: first term in the list
      setFilterTermId(terms[0]._id);
      if (!selectedTermId) setSelectedTermId(terms[0]._id);
    }
  }, [terms, activeTerm, filterTermId, selectedTermId]);

  const { data: feesData, isPending } = useQuery({
    queryKey: ['all-fees'],
    queryFn: async () => { const res = await SERVER.get('fee'); return res?.data; },
    retry: false,
  });
  const fees = feesData?.data || [];

  const { data: studentsData } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => { const res = await SERVER.get('student'); return res?.data; },
    retry: false,
  });
  const allStudents = studentsData?.data || [];

  const { data: paymentsData } = useQuery({
    queryKey: ['fee-payments', selectedFee?._id],
    queryFn: async () => { const res = await SERVER.get(`payment/fee/${selectedFee._id}`); return res?.data; },
    enabled: !!selectedFee?._id,
    retry: false,
  });
  const payments = paymentsData?.data || [];

  const getArmLabel = (id: string) => {
    const arm = classArms.find((a: any) => a._id === id);
    if (!arm) return '';
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
  };
  const getTermLabel = (id: string) => terms.find((t: any) => t._id === id)?.termName || '';
  const getTotalFee = (fee: any) => fee.fees?.reduce((s: number, f: any) => s + (parseFloat(f.amount) || 0), 0) || 0;
  const getTotalPaid = (feeId: string, studentId: string) =>
    payments.filter((p: any) => p.feeId === feeId && p.studentId === studentId).reduce((s: number, p: any) => s + (p.amount || 0), 0);

  const armsForLevel = classArms.filter((a: any) => a.classLevelId === selectedLevelId);
  const filteredFees = fees.filter((f: any) => !filterTermId || f.termId === filterTermId);

  // Build table rows — one per class LEVEL (not arm)
  const tableData = classLevels.map((level: any, i: number) => {
    const levelArms = classArms.filter((a: any) => a.classLevelId === level._id);
    // Find fees for all arms in this level
    const levelFees = filteredFees.filter((f: any) => levelArms.some((a: any) => a._id === f.classArmId));
    const firstFee = levelFees[0];
    // Set if at least one arm has a fee (we treat levels as units)
    const hasFee = levelFees.length > 0;
    return {
      sn: i + 1,
      levelName: level.levelName || '',
      levelShort: level.levelShortName || '',
      amount: firstFee ? `₦${getTotalFee(firstFee).toLocaleString()}` : '-',
      status: hasFee ? (
        <span className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Set</span>
      ) : (
        <span className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Not set</span>
      ),
      actions: '',
      id: level._id,
      _fee: firstFee,
      _levelArms: levelArms,
      _levelId: level._id,
      _isSet: hasFee,
    };
  });

  const headcells = [
    { key: "sn", name: "S/N" },
    { key: "levelName", name: "Level Name" },
    { key: "levelShort", name: "Short Name" },
    { key: "amount", name: "Amount" },
    { key: "status", name: "Status" },
    {
      key: "actions",
      name: [
        {
          name: "View Fee Breakdown",
          handleClick: (row: any) => {
            if (!row._isSet) { toast.error("Fee not set for this level yet", toastOptions); return; }
            setSelectedFee(row._fee); setOpenView(true);
          },
        },
        {
          name: "Edit Fee Breakdown",
          handleClick: (row: any) => {
            if (!row._isSet) {
              // For "Not set" levels, open create form with level pre-selected
              setSelectedLevelId(row._levelId);
              setSelectedArmIds(row._levelArms.map((a: any) => a._id));
              setOpenCreate(true);
              return;
            }
            const existingFee = row._fee;
            setFeeItems(existingFee.fees.filter((f: any) => f.description !== PLATFORM_FEE.description).map((f: any) => ({ description: f.description, amount: f.amount })));
            setSelectedTermId(existingFee.termId);
            setCurrency(existingFee.currency || "NGN");
            setSelectedLevelId(row._levelId);
            setSelectedArmIds(row._levelArms.map((a: any) => a._id));
            setOpenCreate(true);
          },
        },
      ],
    },
  ];

  const handleAddFeeItem = () => setFeeItems([...feeItems, { description: "", amount: "" }]);
  const handleRemoveFeeItem = (i: number) => setFeeItems(feeItems.filter((_, idx) => idx !== i));
  const handleFeeItemChange = (i: number, field: string, value: string) => {
    const u = [...feeItems]; (u[i] as any)[field] = value; setFeeItems(u);
  };

  const handlePreview = () => {
    if (!selectedTermId || selectedArmIds.length === 0 || feeItems.some(f => !f.description || !f.amount)) {
      toast.error("Fill all fields", toastOptions); return;
    }
    setOpenPreview(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await SERVER.post('fee', {
        termId: selectedTermId,
        classArms: selectedArmIds,
        currency,
        fees: [PLATFORM_FEE, ...feeItems],
      });
      toast.success('Fee breakdown saved!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-fees'] });
      resetCreate();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save', toastOptions);
    } finally { setSaving(false); setOpenSaveConfirm(false); }
  };

  const handleDeleteFee = async () => {
    if (!feeToDelete) return;
    try {
      await SERVER.delete(`fee/${feeToDelete._id}`);
      toast.success('Fee deleted!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-fees'] });
      setOpenDelete(false); setFeeToDelete(null); setOpenView(false);
    } catch { toast.error('Failed to delete', toastOptions); }
  };

  const handleRecordPayment = async () => {
    if (!paymentStudentId || !paymentAmount || !selectedFee) {
      toast.error("Select student and amount", toastOptions); return;
    }
    setRecordingPayment(true);
    try {
      const res = await SERVER.post('payment', {
        studentId: paymentStudentId,
        feeId: selectedFee._id,
        amount: paymentAmount,
        paymentMethod,
        reference: paymentRef
      });
      const newPayment = res?.data?.data;
      const student = allStudents.find((s: any) => s._id === paymentStudentId);
      setLastPayment({ ...newPayment, student, fee: selectedFee });
      toast.success('Payment recorded!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['fee-payments', selectedFee._id] });
      setPaymentStudentId(""); setPaymentAmount(""); setPaymentRef("");
      setOpenRecordPayment(false);
      setOpenReceipt(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed', toastOptions);
    } finally { setRecordingPayment(false); }
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !lastPayment) return;
    const p = lastPayment;
    printWindow.document.write(`
      <html><head><title>Payment Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: auto; }
        .header { text-align: center; border-bottom: 2px solid #0E7094; padding-bottom: 15px; margin-bottom: 20px; }
        h1 { color: #0E7094; margin: 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { color: #666; }
        .value { font-weight: 600; }
        .total { font-size: 20px; color: #0E7094; border-top: 2px solid #0E7094; padding-top: 15px; margin-top: 15px; }
        .footer { text-align: center; color: #999; margin-top: 30px; font-size: 12px; }
      </style></head><body>
      <div class="header">
        <h1>${activeSession?.sessionName || 'School'}</h1>
        <p>Payment Receipt</p>
      </div>
      <div class="row"><span class="label">Receipt No.</span><span class="value">${p.reference || p._id?.slice(-8).toUpperCase() || 'N/A'}</span></div>
      <div class="row"><span class="label">Date</span><span class="value">${new Date(p.paymentDate || p.createdAt).toLocaleString()}</span></div>
      <div class="row"><span class="label">Student</span><span class="value">${p.student?.firstName} ${p.student?.surName}</span></div>
      <div class="row"><span class="label">Student ID</span><span class="value">${p.student?.studentID}</span></div>
      <div class="row"><span class="label">Class</span><span class="value">${getArmLabel(p.student?.classArmId)}</span></div>
      <div class="row"><span class="label">Term</span><span class="value">${getTermLabel(p.fee?.termId)}</span></div>
      <div class="row"><span class="label">Payment Method</span><span class="value" style="text-transform:capitalize">${p.paymentMethod}</span></div>
      <div class="row total"><span>Amount Paid</span><span>₦${parseFloat(p.amount).toLocaleString()}</span></div>
      <div class="footer">Thank you for your payment.<br>Powered by Basitech</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const resetCreate = () => {
    setOpenCreate(false); setOpenPreview(false);
    setSelectedTermId(""); setSelectedLevelId(""); setSelectedArmIds([]); setCurrency("NGN");
    setFeeItems([{ description: "", amount: "" }]);
  };

  const feeStudents = selectedFee ? allStudents.filter((s: any) => s.classArmId === selectedFee.classArmId) : [];
  const totalFeeAmt = selectedFee ? getTotalFee(selectedFee) : 0;
  const allFeeItems = [PLATFORM_FEE, ...feeItems];
  const previewTotal = allFeeItems.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);

  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">Fee breakdown for all class levels</p>
        <Button color="tertiary" variant="contained" onClick={() => setOpenCreate(true)}
          sx={{ color: "white", borderRadius: "10px", paddingY: "10px", paddingX: "20px", textTransform: "capitalize" }}>
          Create Fee Breakdown
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Chip label={activeSession?.sessionName || 'No session'} variant="outlined" />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Term</InputLabel>
          <Select value={filterTermId} label="Term" onChange={(e) => setFilterTermId(e.target.value)}
            sx={{ borderRadius: "10px" }}>
            {terms.map((t: any) => <MenuItem key={t._id} value={t._id}>{t.termName}</MenuItem>)}
          </Select>
        </FormControl>
      </div>

      <TableComponent headcells={headcells} tableData={tableData}
        handleClick1={() => setOpenCreate(true)} btn1Name="Create Fee Breakdown" message="No class arms created yet" />

      {/* === CREATE FEE BREAKDOWN MODAL === */}
      <Modal openModal={openCreate} closeModal={resetCreate} title="Create Fee Breakdown" maxWidth="600px">
        <div className="flex flex-col gap-y-5">
          <div className="flex gap-3">
            <Chip label={activeSession?.sessionName || '-'} variant="outlined" />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Term</InputLabel>
              <Select value={selectedTermId} label="Term" onChange={(e) => setSelectedTermId(e.target.value)} sx={{ borderRadius: "10px" }}>
                {terms.map((t: any) => <MenuItem key={t._id} value={t._id}>{t.termName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Currency</InputLabel>
              <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value)} sx={{ borderRadius: "10px" }}>
                <MenuItem value="NGN">Naira</MenuItem>
                <MenuItem value="USD">Dollar</MenuItem>
                <MenuItem value="GBP">Pounds</MenuItem>
              </Select>
            </FormControl>
          </div>

          <FormControl fullWidth size="small">
            <InputLabel>Class Level</InputLabel>
            <Select value={selectedLevelId} label="Class Level"
              onChange={(e) => {
                const levelId = e.target.value;
                setSelectedLevelId(levelId);
                // Auto-select ALL arms of this level
                const armsOfLevel = classArms.filter((a: any) => a.classLevelId === levelId);
                setSelectedArmIds(armsOfLevel.map((a: any) => a._id));
              }}
              sx={{ borderRadius: "10px" }}>
              {classLevels.map((l: any) => <MenuItem key={l._id} value={l._id}>{l.levelShortName || l.levelName}</MenuItem>)}
            </Select>
          </FormControl>

          {selectedLevelId && armsForLevel.length > 0 && (
            <p className="text-xs text-gray-500 -mt-3">
              Will apply to all {armsForLevel.length} arm{armsForLevel.length > 1 ? 's' : ''}: {armsForLevel.map((a: any) => a.armName?.toUpperCase()).join(', ')}
            </p>
          )}

          <div className="flex items-center gap-2 p-2.5 bg-gray-100 rounded-lg">
            <span className="flex-1 text-sm text-gray-500">{PLATFORM_FEE.description}</span>
            <span className="text-sm text-gray-500 w-28 text-right">₦{parseFloat(PLATFORM_FEE.amount).toLocaleString()}</span>
            <span className="text-xs text-gray-400 w-10">Fixed</span>
          </div>

          {feeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" placeholder="Description (e.g Tuition)" value={item.description}
                onChange={(e) => handleFeeItemChange(i, "description", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm" />
              <input type="number" placeholder="Amount" value={item.amount}
                onChange={(e) => handleFeeItemChange(i, "amount", e.target.value)}
                className="w-32 border border-gray-300 rounded-lg p-2.5 text-sm" />
              {feeItems.length > 1 && (
                <IconButton size="small" onClick={() => handleRemoveFeeItem(i)}>
                  <Delete fontSize="small" color="error" />
                </IconButton>
              )}
            </div>
          ))}

          <Button type="button" variant="text" size="small" startIcon={<Add />} onClick={handleAddFeeItem}
            sx={{ textTransform: "capitalize", alignSelf: "flex-start", color: "#0E7094" }}>Add more</Button>

          <Button type="button" color="tertiary" variant="contained" onClick={handlePreview}
            sx={{ color: "white", borderRadius: "10px", paddingY: "12px", width: "fit-content" }}>
            Preview Breakdown
          </Button>
        </div>
      </Modal>

      {/* === PREVIEW === */}
      <Modal openModal={openPreview} closeModal={() => setOpenPreview(false)} title="Fee Breakdown Preview" maxWidth="600px">
        <div className="flex flex-col gap-y-4">
          <div className="flex gap-2 flex-wrap">
            <Chip label={activeSession?.sessionName || '-'} size="small" variant="outlined" />
            <Chip label={getTermLabel(selectedTermId)} size="small" variant="outlined" />
            <Chip label={selectedArmIds.map(id => getArmLabel(id)).join(', ')} size="small" variant="outlined" />
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#E9FAFF]">
                <th className="p-3 text-left font-semibold">Description</th>
                <th className="p-3 text-right font-semibold">Amount</th>
              </tr></thead>
              <tbody>
                {allFeeItems.map((f, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-3">{f.description}</td>
                    <td className="p-3 text-right">₦{parseFloat(f.amount).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="p-3">TOTAL</td>
                  <td className="p-3 text-right">₦{previewTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outlined" onClick={() => setOpenPreview(false)}
              sx={{ borderRadius: "10px", paddingY: "10px", textTransform: "capitalize" }}>Edit</Button>
            <Button type="button" color="tertiary" variant="contained" onClick={() => setOpenSaveConfirm(true)}
              sx={{ color: "white", borderRadius: "10px", paddingY: "10px", textTransform: "capitalize" }}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <MessageModal column desc="Do you wish to save your changes?"
        openModal={openSaveConfirm} closeModal={() => setOpenSaveConfirm(false)}
        handleClick={handleSave} btn1Name={saving ? "Saving..." : "Save changes"} btn2Name="Don't save" />

      {/* === VIEW FEE === */}
      <Modal openModal={openView} closeModal={() => { setOpenView(false); setSelectedFee(null); }}
        title={selectedFee ? `${getArmLabel(selectedFee.classArmId)} Fee Breakdown` : "Fee Breakdown"} maxWidth="750px">
        {selectedFee && (
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-2 flex-wrap">
              <Chip label={activeSession?.sessionName || '-'} size="small" variant="outlined" />
              <Chip label={getTermLabel(selectedFee.termId)} size="small" variant="outlined" />
              <Chip label={getArmLabel(selectedFee.classArmId)} size="small" variant="outlined" />
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#E9FAFF]">
                  <th className="p-3 text-left font-semibold">Description</th>
                  <th className="p-3 text-right font-semibold">Amount</th>
                </tr></thead>
                <tbody>
                  {selectedFee.fees?.map((f: any, i: number) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-3">{f.description}</td>
                      <td className="p-3 text-right">₦{parseFloat(f.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-bold">
                    <td className="p-3">TOTAL</td>
                    <td className="p-3 text-right">₦{totalFeeAmt.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="font-semibold text-sm">Student Payments ({feeStudents.length})</p>
              <Button type="button" variant="outlined" color="tertiary" size="small" onClick={() => setOpenRecordPayment(true)}
                sx={{ borderRadius: "8px", textTransform: "capitalize" }}>Record Payment</Button>
            </div>

            {feeStudents.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 sticky top-0">
                    <th className="p-2 text-left">Student</th><th className="p-2 text-right">Fee</th>
                    <th className="p-2 text-right">Paid</th><th className="p-2 text-right">Balance</th>
                    <th className="p-2 text-center">Status</th>
                  </tr></thead>
                  <tbody>
                    {feeStudents.map((s: any) => {
                      const paid = getTotalPaid(selectedFee._id, s._id);
                      const bal = totalFeeAmt - paid;
                      const st = paid >= totalFeeAmt ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
                      return (
                        <tr key={s._id} className="border-t border-gray-100">
                          <td className="p-2">{s.firstName} {s.surName}</td>
                          <td className="p-2 text-right">₦{totalFeeAmt.toLocaleString()}</td>
                          <td className="p-2 text-right">₦{paid.toLocaleString()}</td>
                          <td className="p-2 text-right">{bal > 0 ? `₦${bal.toLocaleString()}` : '-'}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs ${st === 'Paid' ? 'bg-green-100 text-green-700' : st === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{st}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button type="button" color="tertiary" variant="outlined"
                onClick={() => {
                  const arm = classArms.find((a: any) => a._id === selectedFee.classArmId);
                  if (!arm) return;
                  const levelArms = classArms.filter((a: any) => a.classLevelId === arm.classLevelId);
                  setFeeItems(selectedFee.fees.filter((f: any) => f.description !== PLATFORM_FEE.description).map((f: any) => ({ description: f.description, amount: f.amount })));
                  setSelectedTermId(selectedFee.termId);
                  setCurrency(selectedFee.currency || "NGN");
                  setSelectedLevelId(arm.classLevelId);
                  setSelectedArmIds(levelArms.map((a: any) => a._id));
                  setOpenView(false); setOpenCreate(true);
                }}
                sx={{ borderRadius: "10px", paddingY: "10px", paddingX: "20px", textTransform: "capitalize" }}>
                Edit Breakdown
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment */}
      <Modal openModal={openRecordPayment} closeModal={() => { setOpenRecordPayment(false); setPaymentStudentId(""); setPaymentAmount(""); }}
        title="Record Payment">
        <div className="flex flex-col gap-y-5">
          <FormControl fullWidth size="small">
            <InputLabel>Student</InputLabel>
            <Select value={paymentStudentId} label="Student" onChange={(e) => setPaymentStudentId(e.target.value)} sx={{ borderRadius: "10px" }}>
              {feeStudents.map((s: any) => <MenuItem key={s._id} value={s._id}>{s.firstName} {s.surName} ({s.studentID})</MenuItem>)}
            </Select>
          </FormControl>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Amount *</label>
              <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="Amount" />
            </div>
            <FormControl size="small">
              <InputLabel>Method</InputLabel>
              <Select value={paymentMethod} label="Method" onChange={(e) => setPaymentMethod(e.target.value)} sx={{ borderRadius: "10px" }}>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank transfer">Bank Transfer</MenuItem>
                <MenuItem value="card">Card</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Reference</label>
            <input type="text" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)}
              className="border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="Receipt/Ref no." />
          </div>
          <Button type="button" color="tertiary" variant="contained" onClick={handleRecordPayment} disabled={recordingPayment}
            sx={{ color: "white", borderRadius: "10px", paddingY: "10px", width: "fit-content" }}>
            {recordingPayment ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal openModal={openReceipt} closeModal={() => { setOpenReceipt(false); setLastPayment(null); }}
        title="Payment Receipt" maxWidth="500px">
        {lastPayment && (
          <div className="flex flex-col gap-y-4">
            <div className="text-center border-b-2 border-[#0E7094] pb-3">
              <h3 className="text-lg font-bold text-[#0E7094]">{activeSession?.sessionName}</h3>
              <p className="text-xs text-gray-500">Payment Receipt</p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(lastPayment.paymentDate || lastPayment.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Student</span><span className="font-medium">{lastPayment.student?.firstName} {lastPayment.student?.surName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Student ID</span><span className="font-medium">{lastPayment.student?.studentID}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Class</span><span className="font-medium">{getArmLabel(lastPayment.student?.classArmId)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Term</span><span className="font-medium">{getTermLabel(lastPayment.fee?.termId)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium capitalize">{lastPayment.paymentMethod}</span></div>
              {lastPayment.reference && <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-medium">{lastPayment.reference}</span></div>}
              <div className="flex justify-between border-t-2 border-[#0E7094] pt-3 mt-2 text-lg"><span className="font-semibold">Amount Paid</span><span className="font-bold text-[#0E7094]">₦{parseFloat(lastPayment.amount).toLocaleString()}</span></div>
            </div>
            <Button type="button" color="tertiary" variant="contained" onClick={printReceipt}
              sx={{ color: "white", borderRadius: "10px", paddingY: "10px", textTransform: "capitalize" }}>
              Print Receipt
            </Button>
          </div>
        )}
      </Modal>

      <MessageModal column desc="Are you sure you want to delete this breakdown?"
        openModal={openDelete} closeModal={() => { setOpenDelete(false); setFeeToDelete(null); }}
        handleClick={handleDeleteFee} btn1Name="Yes, delete" btn2Name="No" />
    </div>
  );
}