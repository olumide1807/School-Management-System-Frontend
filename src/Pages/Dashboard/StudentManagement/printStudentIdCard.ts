/**
 * Generate and print a student ID card.
 *
 * Card dimensions: standard credit card size (85.6mm × 53.98mm)
 * Front: School name, student photo, name, ID, class, DOB, blood group
 * Back: Emergency contact, parent info, QR code, school branding
 *
 * @param student - Student data object
 * @param schoolName - Name of the school
 * @param classLabel - e.g. "JSS1 A"
 * @param sessionName - e.g. "2025/2026"
 * @param parentInfo - Optional { name, phone }
 */
export function printStudentIdCard({
  student,
  schoolName,
  classLabel,
  sessionName,
  parentInfo,
}: {
  student: any;
  schoolName: string;
  classLabel: string;
  sessionName: string;
  parentInfo?: { name: string; phone: string };
}) {
  const fullName = `${student.firstName || ""} ${student.surName || ""}`.trim();
  const dob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString()
    : "—";
  const photo = student.photo || "";
  const studentId = student.studentID || "—";
  const bloodGroup = student.bloodGroup || "—";
  const gender = student.gender || "—";
  const emergencyName = student.emergencyContact?.name || parentInfo?.name || "—";
  const emergencyPhone = student.emergencyContact?.phone || parentInfo?.phone || "—";

  // QR code via free API (contains the student ID)
  const qrData = encodeURIComponent(studentId);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=120x120&margin=4`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>ID Card - ${fullName}</title>
  <style>
    @page {
      size: auto;
      margin: 10mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
      gap: 20px;
    }
    .card {
      width: 340px;
      height: 214px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      position: relative;
    }

    /* ===== FRONT ===== */
    .front {
      background: linear-gradient(135deg, #0E7094 0%, #0a5a75 50%, #084d66 100%);
      color: white;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }
    .front-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.3);
    }
    .front-header .logo {
      width: 32px;
      height: 32px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: #0E7094;
      font-size: 14px;
      flex-shrink: 0;
    }
    .front-header .school-name {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .front-header .id-label {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.8;
      margin-left: auto;
    }
    .front-body {
      display: flex;
      gap: 14px;
      flex: 1;
    }
    .photo-frame {
      width: 80px;
      height: 95px;
      border-radius: 8px;
      border: 2px solid rgba(255,255,255,0.5);
      overflow: hidden;
      flex-shrink: 0;
      background: rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .photo-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-frame .initials {
      font-size: 28px;
      font-weight: 700;
      opacity: 0.6;
    }
    .info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }
    .student-name {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
    }
    .info-row .label {
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-row .value {
      font-weight: 600;
    }
    .front-footer {
      margin-top: auto;
      font-size: 8px;
      opacity: 0.7;
      text-align: center;
      padding-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }

    /* ===== BACK ===== */
    .back {
      background: white;
      color: #333;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }
    .back-header {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0E7094;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #0E7094;
    }
    .back-body {
      display: flex;
      gap: 16px;
      flex: 1;
    }
    .back-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .back-info .section-title {
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      color: #0E7094;
      letter-spacing: 0.5px;
    }
    .back-info .detail {
      font-size: 9px;
      line-height: 1.4;
    }
    .back-info .detail .dlabel {
      color: #888;
    }
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .qr-section img {
      width: 80px;
      height: 80px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .qr-section .qr-label {
      font-size: 7px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .back-footer {
      margin-top: auto;
      text-align: center;
      padding-top: 8px;
      border-top: 1px solid #eee;
      font-size: 7px;
      color: #999;
    }
    .back-footer span {
      color: #0E7094;
      font-weight: 600;
    }

    .label-text {
      text-align: center;
      font-size: 11px;
      color: #999;
      margin-bottom: 4px;
    }

    @media print {
      body { background: white; gap: 30px; }
      .card { box-shadow: none; border: 1px solid #ddd; }
      .label-text { display: none; }
    }
  </style>
</head>
<body>

  <p class="label-text">Front</p>
  <div class="card front">
    <div class="front-header">
      <div class="logo">B</div>
      <div class="school-name">${schoolName}</div>
      <div class="id-label">Student ID Card</div>
    </div>
    <div class="front-body">
      <div class="photo-frame">
        ${photo
          ? `<img src="${photo}" alt="Photo" crossorigin="anonymous" />`
          : `<span class="initials">${(student.firstName?.[0] || "")+(student.surName?.[0] || "")}</span>`
        }
      </div>
      <div class="info">
        <div class="student-name">${fullName.toUpperCase()}</div>
        <div class="info-row"><span class="label">Student ID</span><span class="value">${studentId}</span></div>
        <div class="info-row"><span class="label">Class</span><span class="value">${classLabel}</span></div>
        <div class="info-row"><span class="label">Gender</span><span class="value">${gender}</span></div>
        <div class="info-row"><span class="label">Date of Birth</span><span class="value">${dob}</span></div>
        <div class="info-row"><span class="label">Blood Group</span><span class="value">${bloodGroup}</span></div>
      </div>
    </div>
    <div class="front-footer">Valid for ${sessionName || "Current"} Academic Session</div>
  </div>

  <p class="label-text">Back</p>
  <div class="card back">
    <div class="back-header">${schoolName} — Student Identification</div>
    <div class="back-body">
      <div class="back-info">
        <div class="section-title">Emergency Contact</div>
        <div class="detail"><span class="dlabel">Name:</span> ${emergencyName}</div>
        <div class="detail"><span class="dlabel">Phone:</span> ${emergencyPhone}</div>

        ${parentInfo ? `
        <div class="section-title" style="margin-top: 6px;">Parent/Guardian</div>
        <div class="detail"><span class="dlabel">Name:</span> ${parentInfo.name}</div>
        <div class="detail"><span class="dlabel">Phone:</span> ${parentInfo.phone}</div>
        ` : ""}

        <div class="detail" style="margin-top: auto; font-size: 8px; color: #999;">
          If found, please return to the school.
        </div>
      </div>
      <div class="qr-section">
        <img src="${qrUrl}" alt="QR Code" />
        <div class="qr-label">Scan to verify</div>
      </div>
    </div>
    <div class="back-footer">Powered by <span>Basitech</span></div>
  </div>

</body>
</html>`);
  printWindow.document.close();

  // Wait for images (photo + QR code) to load before printing
  setTimeout(() => {
    printWindow.print();
  }, 1500);
}