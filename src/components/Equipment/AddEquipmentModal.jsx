import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { createEquipment } from '../../utils/api';
import { X } from 'lucide-react';
import './AddEquipmentModal.css';

const AddEquipmentModal = ({ onClose }) => {
    const { teams, equipment, loading } = useApp(); // Use context to trigger refreshes if set up, or manual refresh
    // Note: useApp might need a way to refresh equipment list. 
    // For now, we'll just reload the page or assume useApp updates are handled via a refresh function strictly passed or we modify useApp.
    // Looking at useApp, it has state 'equipment', but no explicit 'refreshEquipment'.
    // We can manually add to the state if `createEquipment` successful.

    // Actually, looking at `useApp` in `AppContext.jsx`:
    // It has `setEquipment` (internal) and `equipment` state.
    // It doesn't seem to export a global "refresh" or "addEquipment" method to the context consumer except via direct API calls which don't update context state automatically unless we do it.
    // `createRequest` updates state. We might want to add `addEquipment` to context or just handle it here and force reload/notify parent.
    // Let's adhere to the pattern in AppContext if possible?
    // Wait, AppContext was visible in previous turn. Let's check if it exposes `createEquipment` wrapper.
    // It exposes `requests` related actions. It does NOT expose `createEquipment` wrapper.
    // So I should probably add `addNewEquipment` to AppContext or handle state update in local component if I can't modify AppContext easily.
    // Plan: modify AppContext to include `addNewEquipment` for consistency, OR just call API and window.location.reload() for MVP. 
    // Better: modify AppContext.

    // BUT first, let's just make the modal and pass a callback `onSuccess` if needed, or modify AppContext later.
    // Actually, the plan says "Connects to createEquipment API". 
    // I'll import `createEquipment` from api.js directly for now, and maybe reload page or rely on parent refetch.
    // Re-reading EquipmentList.jsx: `const { equipment, createRequest } = useApp();`
    // It generates list from `equipment`. If I add item, I need to update `equipment` in context.

    // I will write this component first.

    const [formData, setFormData] = useState({
        name: '',
        serial_number: '',
        department: '',
        location: '',
        maintenance_team: '',
        purchase_date: '',
        description: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Convert team ID to integer
            const payload = {
                ...formData,
                maintenance_team: formData.maintenance_team ? parseInt(formData.maintenance_team) : null,
                is_active: true
            };

            await createEquipment(payload);
            // Ideally we update context here.
            // For now, we will close. The parent might need to know to refresh.
            // I will update AppContext in a separate step to support this cleanly. 
            // Or I can force a window reload which is "safe" but ugly.
            // Let's do the "dirty" window reload or parent callback for the very first iteration if AppContext isn't touched.
            // Wait, I can touch AppContext! I should. 
            // I'll stick to just creating the component here.

            window.location.reload(); // Simple refresh to show new data
            onClose();
        } catch (error) {
            console.error('Error creating equipment:', error);
            alert('Failed to add equipment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add New Equipment</h3>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Equipment Name *</label>
                        <input
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Generator X1"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Serial Number *</label>
                            <input
                                name="serial_number"
                                required
                                value={formData.serial_number}
                                onChange={handleChange}
                                placeholder="SN-123456"
                            />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <select name="department" value={formData.department} onChange={handleChange} required>
                                <option value="">Select Department</option>
                                <option value="Production">Production</option>
                                <option value="Facilities">Facilities</option>
                                <option value="IT">IT</option>
                                <option value="Fleet">Fleet</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Building A, Floor 2"
                            />
                        </div>
                        <div className="form-group">
                            <label>Maintenance Team</label>
                            <select name="maintenance_team" value={formData.maintenance_team} onChange={handleChange}>
                                <option value="">Select Team</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.team_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Purchase Date</label>
                        <input
                            type="date"
                            name="purchase_date"
                            value={formData.purchase_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Equipment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEquipmentModal;
