import { useState, useEffect, useRef } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api/auth";

export default function Profile() {
    const { token } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    // Form fields
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string>("");
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
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true); setMsg(null);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("phone", phone);
            formData.append("street", street);
            formData.append("city", city);
            formData.append("state", state);
            formData.append("pincode", pincode);
            if (photoFile) formData.append("profilePhoto", photoFile);

            const res = await axios.put(`${API}/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data.user);
            setMsg({ text: "✅ Profile updated successfully!", ok: true });
            setPhotoFile(null);
        } catch (err: any) {
            setMsg({ text: err?.response?.data?.message || "Update failed.", ok: false });
        } finally { setSaving(false); }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 14px", borderRadius: "8px",
        border: "1px solid #e2e8f0", fontSize: "0.95rem", boxSizing: "border-box",
        outline: "none", color: "#2c3e50",
    };
    const labelStyle: React.CSSProperties = {
        display: "block", marginBottom: "6px", color: "#64748b", fontSize: "0.85rem", fontWeight: "600",
    };

    if (loading) return (
        <DashboardLayout title="My Profile">
            <p style={{ color: "#888" }}>Loading profile...</p>
        </DashboardLayout>
    );

    const initials = name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

    return (
        <DashboardLayout title="My Profile">
            <div style={{ maxWidth: "720px", margin: "0 auto" }}>

                {/* Profile Photo Card */}
                <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "30px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "25px" }}>
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile"
                                style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "3px solid #667eea" }} />
                        ) : (
                            <div style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "#667eea", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.8rem", fontWeight: "bold", border: "3px solid #667eea" }}>
                                {initials}
                            </div>
                        )}
                        <button onClick={() => fileRef.current?.click()}
                            style={{ position: "absolute", bottom: 0, right: 0, width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#667eea", border: "2px solid white", cursor: "pointer", color: "white", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            ✏️
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                    </div>

                    <div>
                        <h2 style={{ margin: "0 0 4px 0", color: "#2c3e50", fontSize: "1.3rem" }}>{user?.name || "Your Name"}</h2>
                        <p style={{ margin: "0 0 6px 0", color: "#888", fontSize: "0.9rem" }}>{user?.email}</p>
                        <span style={{ backgroundColor: "#f0eeff", color: "#667eea", padding: "3px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600", textTransform: "capitalize" }}>
                            {user?.role}
                        </span>
                        <p style={{ margin: "8px 0 0 0", color: "#bbb", fontSize: "0.8rem" }}>
                            Member since {new Date(user?.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                        </p>
                    </div>
                </div>

                {/* Edit Form */}
                <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <h3 style={{ margin: "0 0 25px 0", color: "#2c3e50", fontSize: "1.1rem", borderBottom: "1px solid #f0f0f0", paddingBottom: "15px" }}>
                        Personal Information
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your name" />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+91 XXXXXXXXXX" />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input value={user?.email || ""} disabled
                            style={{ ...inputStyle, backgroundColor: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" }} />
                        <p style={{ margin: "4px 0 20px 0", color: "#aaa", fontSize: "0.78rem" }}>Email cannot be changed</p>
                    </div>

                    <h3 style={{ margin: "0 0 20px 0", color: "#2c3e50", fontSize: "1.1rem", borderBottom: "1px solid #f0f0f0", paddingBottom: "15px" }}>
                        Delivery Address
                    </h3>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Street / House No.</label>
                        <input value={street} onChange={e => setStreet(e.target.value)} style={inputStyle} placeholder="e.g. 12, MG Road, Sector 4" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                        <div>
                            <label style={labelStyle}>City</label>
                            <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} placeholder="e.g. Mumbai" />
                        </div>
                        <div>
                            <label style={labelStyle}>State</label>
                            <input value={state} onChange={e => setState(e.target.value)} style={inputStyle} placeholder="e.g. Maharashtra" />
                        </div>
                        <div>
                            <label style={labelStyle}>Pincode</label>
                            <input value={pincode} onChange={e => setPincode(e.target.value)} style={inputStyle} placeholder="e.g. 400001" maxLength={6} />
                        </div>
                    </div>

                    {msg && (
                        <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", backgroundColor: msg.ok ? "#f0fdf4" : "#fef2f2", color: msg.ok ? "#16a34a" : "#dc2626", fontWeight: "600", fontSize: "0.9rem" }}>
                            {msg.text}
                        </div>
                    )}

                    <button onClick={handleSave} disabled={saving}
                        style={{ padding: "14px 35px", backgroundColor: saving ? "#aaa" : "#667eea", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer" }}>
                        {saving ? "Saving..." : "💾 Save Changes"}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
