import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, MapPin, Calendar, Wrench, Search, Filter, MoreHorizontal } from 'lucide-react';
import AddEquipmentModal from '../components/Equipment/AddEquipmentModal';
import './EquipmentList.css';

const EquipmentList = () => {
    const { equipment, createRequest } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');


    const [showAddModal, setShowAddModal] = useState(false);

    const departments = ['all', ...new Set(equipment.map(eq => eq.department).filter(Boolean))];

    const filteredEquipment = equipment.filter(eq => {
        const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || eq.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const getStatusColor = (status) => {
        return status ? 'var(--success)' : 'var(--danger)';
    };

    return (
        <div className="equipment-view">
            <div className="equipment-header">
                <div>
                    <h2>Equipment Inventory</h2>
                    <p className="text-muted">Manage system assets and track maintenance schedules</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Package size={18} />
                        Add Equipment
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="equipment-filters">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or serial..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={18} className="text-muted" />
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="department-select"
                    >
                        <option value="all">All Departments</option>
                        {departments.filter(d => d !== 'all').map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Equipment Table */}
            <div className="equipment-table-container glass-card">
                <table className="equipment-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Serial Number</th>
                            <th>Department</th>
                            <th>Location</th>
                            <th>Purchase Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEquipment.map(eq => (
                            <tr key={eq.id}>
                                <td className="font-medium">
                                    <div className="equipment-name-cell">
                                        <div className="equipment-icon-sm">
                                            <Package size={16} />
                                        </div>
                                        {eq.name}
                                    </div>
                                </td>
                                <td className="text-mono text-sm">{eq.serial_number}</td>
                                <td>
                                    <span className="badge badge-department">{eq.department}</span>
                                </td>
                                <td className="text-muted text-sm">
                                    <div className="flex-center">
                                        <MapPin size={14} style={{ marginRight: 4 }} />
                                        {eq.location}
                                    </div>
                                </td>
                                <td className="text-sm">
                                    {new Date(eq.purchase_date).toLocaleDateString()}
                                </td>
                                <td>
                                    <span className="status-dot" style={{ backgroundColor: getStatusColor(eq.is_active) }}></span>
                                    {eq.is_active ? 'Active' : 'Inactive'}
                                </td>
                                <td>
                                    <button className="icon-btn-sm" title="View Details">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredEquipment.length === 0 && (
                    <div className="empty-state">
                        <Package size={48} className="text-muted" />
                        <p>No equipment found matching your criteria.</p>
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddEquipmentModal onClose={() => setShowAddModal(false)} />
            )}
        </div>
    );
};

export default EquipmentList;
