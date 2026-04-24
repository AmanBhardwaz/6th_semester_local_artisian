import { useState, useEffect, useRef } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth`;

export default function Profile() {
    const { token } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [photoPreview, setPhotoPreview] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    useEffect(() => {
        axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                const u = res.data;
                setUser(u);
                setName(u.name || "");
                setPhone(u.phone || "");
                setStreet(u.address?.street || "");
                setCity(u.address?.city || "");
                setState(u.address?.state || "");
                setPincode(u.address?.pincode || "");
                setPhotoPreview(u.profilePhoto || "");
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [token]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
    };

    const handleSave = async () => {
        setSaving(true); setMsg(null);
        try {
            const fd = new FormData();
            fd.append("name", name); fd.append("phone", phone);
            fd.append("street", street); fd.append("city", city);
            fd.append("state", state); fd.append("pincode", pincode);
            if (photoFile) fd.append("profilePhoto", photoFile);

            const res = await axios.put(`${API}/profile`, fd, { headers: { Authorization: `Bearer ${token}` } });
            setUser(res.data.user);
            setMsg({ text: "✅ Profile updated successfully!", ok: true });
            setPhotoFile(null);
        } catch (err: any) {
            setMsg({ text: err?.response?.data?.message || "Update failed.", ok: false });
        } finally { setSaving(false); }
    };

    if (loading) return (
        <DashboardLayout title="My Profile">
            <p style={{ color: "#9ca3af" }}>Loading profile...</p>
        </DashboardLayout>
    );

    const initials = name
        ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <DashboardLayout title="My Profile">
            <div className="profile-wrap">

                {/* ── Avatar Card ── */}
                <div className="profile-avatar-card">
                    <div className="profile-avatar-wrap">
                        {photoPreview ? (
                            <img className="profile-avatar-img" src={photoPreview} alt="Profile" />
                        ) : (
                            <div className="profile-avatar-initials">{initials}</div>
                        )}
                        <button
                            className="profile-edit-photo-btn"
                            onClick={() => fileRef.current?.click()}
                            title="Change photo"
                        >
                            ✏️
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                    </div>

                    <div>
                        <h2 className="profile-meta-name">{user?.name || "Your Name"}</h2>
                        <p className="profile-meta-email">{user?.email}</p>
                        <span className="profile-role-badge">{user?.role}</span>
                        <p className="profile-member-since">
                            Member since {new Date(user?.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                        </p>
                    </div>
                </div>

                {/* ── Edit Form ── */}
                <div className="profile-form-card">
                    <h3 className="profile-section-title">Personal Information</h3>

                    <div className="profile-grid-2">
                        <div>
                            <label className="profile-label">Full Name</label>
                            <input className="profile-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                        </div>
                        <div>
                            <label className="profile-label">Phone Number</label>
                            <input className="profile-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" />
                        </div>
                    </div>

                    <div className="profile-field">
                        <label className="profile-label">Email Address</label>
                        <input className="profile-input" value={user?.email || ""} disabled />
                        <p className="profile-hint">Email cannot be changed</p>
                    </div>

                    <h3 className="profile-section-title" style={{ marginTop: "8px" }}>Delivery Address</h3>

                    <div className="profile-field">
                        <label className="profile-label">Street / House No.</label>
                        <input className="profile-input" value={street} onChange={e => setStreet(e.target.value)} placeholder="e.g. 12, MG Road, Sector 4" />
                    </div>

                    <div className="profile-grid-3">
                        <div>
                            <label className="profile-label">City</label>
                            <input className="profile-input" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai" />
                        </div>
                        <div>
                            <label className="profile-label">State</label>
                            <input className="profile-input" value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Maharashtra" />
                        </div>
                        <div>
                            <label className="profile-label">Pincode</label>
                            <input className="profile-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 400001" maxLength={6} />
                        </div>
                    </div>

                    {msg && (
                        <div className={`profile-msg ${msg.ok ? "ok" : "err"}`}>
                            {msg.text}
                        </div>
                    )}

                    <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "💾 Save Changes"}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
