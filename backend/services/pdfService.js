const PDFDocument = require("pdfkit");

/**
 * Generates a visitor badge PDF and pipes it to the provided response stream.
 * @param {object} res  - Express response object (used as writable stream)
 * @param {object} data - { visitorName, hostName, validUntil, qrCodeImage, company }
 */
const generateBadgePDF = (res, data) => {
  const { visitorName, hostName, validUntil, qrCodeImage, company } = data;

  const doc = new PDFDocument({ size: "A6", margin: 30 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="visitor-badge-${Date.now()}.pdf"`
  );

  doc.pipe(res);

  // Header background bar
  doc.rect(0, 0, doc.page.width, 60).fill("#1a56db");

  doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold").text(
    "VISITOR PASS",
    30,
    20,
    { align: "center" }
  );

  doc.moveDown(2);

  // Visitor name
  doc.fillColor("#111827").fontSize(14).font("Helvetica-Bold").text(
    visitorName,
    { align: "center" }
  );

  if (company) {
    doc.fontSize(10).font("Helvetica").fillColor("#6b7280").text(company, { align: "center" });
  }

  doc.moveDown(0.5);

  doc.fontSize(10).fillColor("#374151").text(`Host: ${hostName}`, { align: "center" });
  doc.text(
    `Valid Until: ${new Date(validUntil).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    { align: "center" }
  );

  doc.moveDown(1);

  // Photo placeholder box
  const photoX = doc.page.width / 2 - 40;
  const photoY = doc.y;
  doc.rect(photoX, photoY, 80, 80).strokeColor("#d1d5db").lineWidth(1).stroke();
  doc.fillColor("#9ca3af").fontSize(8).text("PHOTO", photoX, photoY + 34, { width: 80, align: "center" });

  doc.moveDown(6);

  // QR code image (base64 data URL -> Buffer)
  if (qrCodeImage) {
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");
    const qrX = doc.page.width / 2 - 60;
    doc.image(imgBuffer, qrX, doc.y, { width: 120, height: 120 });
    doc.moveDown(9);
  }

  doc.fontSize(8).fillColor("#6b7280").text(
    "This pass must be visible at all times on the premises.",
    { align: "center" }
  );

  doc.end();
};

module.exports = { generateBadgePDF };
