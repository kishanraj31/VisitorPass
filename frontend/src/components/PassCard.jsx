import { downloadBadgePDF, revokePass } from "../api/passApi";
import "./PassCard.css";

const PassCard = ({ pass, showRevoke = false, onRevoke }) => {
  const {
    _id,
    qrCodeImage,
    issuedAt,
    validUntil,
    status,
    appointmentId,
  } = pass;

  const visitor = appointmentId?.visitorId;
  const host = appointmentId?.hostId;

  const handleDownload = async () => {
    try {
      const res = await downloadBadgePDF(_id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `visitor-badge-${_id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download badge PDF.");
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm("Revoke this pass?")) return;
    try {
      await revokePass(_id);
      onRevoke?.();
    } catch {
      alert("Failed to revoke pass.");
    }
  };

  const statusClass = {
    active: "status-approved",
    used: "status-completed",
    expired: "status-rejected",
    revoked: "status-rejected",
  }[status] || "";

  return (
    <div className="pass-card" id={`pass-${_id}`}>
      <div className="pass-header">
        <div>
          <h3 className="pass-visitor-name">{visitor?.name || "Visitor"}</h3>
          <p className="pass-company">{visitor?.company}</p>
          {host && <p className="pass-host">Host: {host.name}</p>}
        </div>
        <span className={`status-badge ${statusClass}`}>{status}</span>
      </div>

      {qrCodeImage && (
        <div className="pass-qr-container">
          <img src={qrCodeImage} alt="QR Code" className="pass-qr" />
        </div>
      )}

      <div className="pass-meta">
        <p>Issued: {new Date(issuedAt).toLocaleString("en-IN")}</p>
        <p>Valid Until: {new Date(validUntil).toLocaleString("en-IN")}</p>
      </div>

      <div className="pass-actions">
        <button id={`btn-download-pdf-${_id}`} className="btn-primary" onClick={handleDownload}>
          ⬇ Download PDF Badge
        </button>
        {showRevoke && status === "active" && (
          <button id={`btn-revoke-${_id}`} className="btn-danger" onClick={handleRevoke}>
            Revoke Pass
          </button>
        )}
      </div>
    </div>
  );
};

export default PassCard;
