import { useState } from "react";
import "./VisitorForm.css";

const VisitorForm = ({ onSubmit, loading, hosts = [] }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", purpose: "", hostId: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (photo) fd.append("photo", photo);
    onSubmit(fd);
  };

  return (
    <form className="visitor-form" onSubmit={handleSubmit} id="visitor-pre-register-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vf-name">Full Name *</label>
          <input
            id="vf-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Anil Kumar"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="vf-email">Email *</label>
          <input
            id="vf-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="anil@techsol.com"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vf-phone">Phone</label>
          <input
            id="vf-phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>
        <div className="form-group">
          <label htmlFor="vf-company">Company</label>
          <input
            id="vf-company"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="TechSol Pvt Ltd"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="vf-purpose">Purpose of Visit</label>
        <input
          id="vf-purpose"
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          placeholder="Product Demo, Client Meeting..."
        />
      </div>

      {hosts.length > 0 && (
        <div className="form-group">
          <label htmlFor="vf-host">Select Host (Employee)</label>
          <select id="vf-host" name="hostId" value={form.hostId} onChange={handleChange} required>
            <option value="">-- Select a host --</option>
            {hosts.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="vf-photo">Photo (optional, max 5MB)</label>
        <input
          id="vf-photo"
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="file-input"
        />
        {preview && (
          <img src={preview} alt="Preview" className="photo-preview" />
        )}
      </div>

      <button id="vf-submit" type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Submitting..." : "Submit Pre-Registration"}
      </button>
    </form>
  );
};

export default VisitorForm;
