import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import './Reports.css';

const Reports = () => {
    const { requests, teams, equipment } = useApp();

    // Analytics data
    // Status in DB is Title Case: 'New', 'In Progress', 'Repaired', 'Scrap'
    const statusCounts = {
        new: requests.filter(r => r.status === 'New').length,
        inProgress: requests.filter(r => r.status === 'In Progress').length,
        repaired: requests.filter(r => r.status === 'Repaired').length,
        scrap: requests.filter(r => r.status === 'Scrap').length,
    };

    // Requests by Team
    // requests store 'team' as ID. teams have 'id' and 'team_name'.
    const requestsByTeam = teams.map((team, index) => {
        // Teams might just be {id, team_name}
        return {
            name: team.team_name,
            count: requests.filter(r => r.team === team.id).length,
            color: index % 2 === 0 ? '#667eea' : '#fbbf24', // simple alternating colors or map from a palette
        };
    });

    // Requests by Equipment Category/Department
    // requests store 'equipment' as ID. equipment has 'id' and 'department'.
    const categoryCounts = {};
    requests.forEach(req => {
        const equip = equipment.find(e => e.id === req.equipment);
        if (equip && equip.department) {
            categoryCounts[equip.department] = (categoryCounts[equip.department] || 0) + 1;
        }
    });

    const requestsByCategory = Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value,
    }));

    const COLORS = ['#667eea', '#4facfe', '#f093fb', '#fbbf24', '#ff6b6b', '#20c997'];

    return (
        <div className="reports-view">
            <div className="reports-header">
                <div>
                    <h2>Analytics & Reports</h2>
                    <p className="text-muted">Maintenance insights and performance metrics</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-box">
                    <div className="stat-icon" style={{ background: 'var(--primary-gradient)' }}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Requests</span>
                        <span className="stat-number">{requests.length}</span>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon" style={{ background: 'var(--warning-gradient)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">In Progress</span>
                        <span className="stat-number">{statusCounts.inProgress}</span>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon" style={{ background: 'var(--success-gradient)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Completed</span>
                        <span className="stat-number">{statusCounts.repaired}</span>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon" style={{ background: 'var(--danger-gradient)' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Scrapped</span>
                        <span className="stat-number">{statusCounts.scrap}</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Requests by Team Bar Chart */}
                <div className="chart-card glass-card">
                    <h3>Requests per Team</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={requestsByTeam}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" name="Requests" fill="#667eea">
                                {requestsByTeam.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Requests by Category Pie Chart */}
                <div className="chart-card glass-card">
                    <h3>Requests per Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={requestsByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {requestsByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="glass-card">
                <h3>Recent Requests</h3>
                <div className="table-container">
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>Equipment</th>
                                <th>Status</th>
                                <th>Type</th>
                                <th>Team</th>
                                <th>Scheduled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.slice(0, 10).map(req => {
                                // requests have team_name and equipment_name from serializer
                                return (
                                    <tr key={req.id}>
                                        <td>{req.equipment_name || 'N/A'}</td>
                                        <td>
                                            <span className={`badge badge-${req.status === 'New' ? 'primary' : req.status === 'In Progress' ? 'warning' : req.status === 'Repaired' ? 'success' : 'danger'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>
                                            {req.request_type}
                                        </td>
                                        <td>{req.team_name || 'N/A'}</td>
                                        <td>{req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
