import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin`;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const fetchUsers = (role: string) => {
        setLoading(true);
        const q = role ? `?role=${role}` : "";
        axios.get(`${API}/users${q}`, { headers: authHeader() })
            .then(r => setUsers(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(filter); }, [filter]);

    const ban = async (id: string, name: string) => {
        if (!confirm(`Ban ${name}? They won't be able to login.`)) return;
        await axios.put(`${API}/users/${id}/ban`, {}, { headers: authHeader() });
        setUsers(u => u.map(x => x._id === id ? { ...x, isBanned: true } : x));
    };

    const unban = async (id: string) => {
        await axios.put(`${API}/users/${id}/unban`, {}, { headers: authHeader() });
        setUsers(u => u.map(x => x._id === id ? { ...x, isBanned: false } : x));
    };

    const TABS = [
        { label: "All", value: "" },
        { label: "Consumers", value: "consumer" },
        { label: "Artisans", value: "artisan" },
    ];

    return (
        <DashboardLayout title="User Management">
            <div className="admin-section">
                <div className="admin-section-header">
                    <h3 className="admin-section-title">👥 Users ({users.length})</h3>
                    <div className="admin-tabs">
                        {TABS.map(t => (
                            <button key={t.value} className={`admin-tab${filter === t.value ? " active" : ""}`}
                                onClick={() => setFilter(t.value)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="admin-table-wrap">
                    {loading ? (
                        <p style={{ padding: "24px", color: "#9ca3af" }}>Loading...</p>
                    ) : users.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">👤</div>
                            <p>No users found.</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 600 }}>{u.name || "—"}</td>
                                        <td style={{ color: "#6b7280", fontSize: "0.82rem" }}>{u.email}</td>
                                        <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                                        <td>
                                            <span className={`badge ${u.isBanned ? "badge-banned" : "badge-approved"}`}>
                                                {u.isBanned ? "Banned" : "Active"}
                                            </span>
                                        </td>
                                        <td style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                                            {new Date(u.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td>
                                            {u.role !== "admin" && (
                                                u.isBanned
                                                    ? <button className="btn-unban" onClick={() => unban(u._id)}>Unban</button>
                                                    : <button className="btn-ban"   onClick={() => ban(u._id, u.name)}>Ban</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
