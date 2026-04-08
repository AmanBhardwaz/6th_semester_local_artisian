import DashboardLayout from "../components/DashboardLayout";

export default function Admin() {
    const stats = [
        { label: "Total Users", value: "1,240", color: "#3498db" },
        { label: "Active Sellers", value: "85", color: "#2ecc71" },
        { label: "Total Revenue", value: "$45.2k", color: "#9b59b6" },
    ];

    const recentUsers = [
        { id: 1, name: "Alice Johnson", role: "Consumer", date: "2023-10-25", status: "Active" },
        { id: 2, name: "Bob Smith", role: "Artisan", date: "2023-10-24", status: "Pending" },
        { id: 3, name: "Charlie Brown", role: "Consumer", date: "2023-10-24", status: "Active" },
        { id: 4, name: "Diana Prince", role: "Artisan", date: "2023-10-23", status: "Active" },
    ];

    return (
        <DashboardLayout title="Admin Overview">

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderLeft: `5px solid ${stat.color}` }}>
                        <h3 style={{ margin: "0 0 10px 0", color: "#7f8c8d", fontSize: "1rem" }}>{stat.label}</h3>
                        <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Table */}
            <div style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid #ecf0f1" }}>
                    <h3 style={{ margin: 0, color: "#2c3e50" }}>Recent Registrations</h3>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8f9fa", textAlign: "left" }}>
                            <th style={{ padding: "15px 20px", color: "#7f8c8d", fontWeight: "600" }}>Name</th>
                            <th style={{ padding: "15px 20px", color: "#7f8c8d", fontWeight: "600" }}>Role</th>
                            <th style={{ padding: "15px 20px", color: "#7f8c8d", fontWeight: "600" }}>Date</th>
                            <th style={{ padding: "15px 20px", color: "#7f8c8d", fontWeight: "600" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: "1px solid #ecf0f1" }}>
                                <td style={{ padding: "15px 20px", color: "#2c3e50" }}>{user.name}</td>
                                <td style={{ padding: "15px 20px" }}>
                                    <span style={{
                                        padding: "5px 10px",
                                        borderRadius: "15px",
                                        fontSize: "0.8rem",
                                        backgroundColor: user.role === "Artisan" ? "#e8f6f3" : "#eaf2f8",
                                        color: user.role === "Artisan" ? "#2ecc71" : "#3498db"
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: "15px 20px", color: "#7f8c8d" }}>{user.date}</td>
                                <td style={{ padding: "15px 20px" }}>
                                    <span style={{ color: user.status === "Active" ? "#2ecc71" : "#f1c40f", fontWeight: "600" }}>
                                        {user.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </DashboardLayout>
    );
}
