import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchUsers } from '../../utils/api';
import { X } from 'lucide-react';
import './NewRequestModal.css';

const NewRequestModal = ({ onClose, initialData = {} }) => {
    const { user, equipment, technicians, teams, createRequest } = useApp();
    const [formData, setFormData] = useState({
        equipment: initialData.equipment || '',
        subject: initialData.subject || '',
        request_type: initialData.request_type || 'Corrective',
        team: initialData.team || '',
        technician: initialData.technician || '',
        scheduled_date: initialData.scheduled_date || '',
        due_date: initialData.due_date || '',
        duration_hours: initialData.duration_hours || '',
        client: initialData.client || '',
    });

    const [filteredTechnicians, setFilteredTechnicians] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [clients, setClients] = useState([]);

    // Fetch clients if user is manager
    useEffect(() => {
        if (user && user.role === 'manager') {
            fetchUsers({ role: 'user' }).then(data => {
                setClients(data.results || data);
            }).catch(err => console.error('Error fetching clients:', err));
        }
    }, [user]);

    // Filter technicians when team changes
    useEffect(() => {
        if (formData.team) {
            const teamTechs = technicians.filter(tech => tech.team === parseInt(formData.team));
            setFilteredTechnicians(teamTechs);
        } else {
            setFilteredTechnicians(technicians);
        }
    }, [formData.team, technicians]);

    // Update selected equipment details when equipment changes
    useEffect(() => {
        if (formData.equipment) {
            const eq = equipment.find(e => e.id === parseInt(formData.equipment));
            setSelectedEquipment(eq);
            if (eq && eq.maintenance_team) {
                setFormData(prev => ({ ...prev, team: eq.maintenance_team }));
            }
        } else {
            setSelectedEquipment(null);
        }
    }, [formData.equipment, equipment]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requestData = {
            subject: formData.subject,
            request_type: formData.request_type,
            equipment: parseInt(formData.equipment),
            team: parseInt(formData.team),
            technician: formData.technician ? parseInt(formData.technician) : null,
            scheduled_date: formData.scheduled_date || null,
            due_date: formData.due_date || null,
            duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null,
            client: formData.client ? parseInt(formData.client) : null,
        };

        try {
            await createRequest(requestData);
            onClose();
        } catch (error) {
            console.error('Error creating request:', error);
            alert('Failed to create request. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ borderBottom: 'none', paddingBottom: 0 }}>Create New Maintenance Request</h3>
                    <button className="icon-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Equipment *</label>
                        <select name="equipment" value={formData.equipment} onChange={handleChange} required>
                            <option value="">Select equipment</option>
                            {equipment.map(eq => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.name} - {eq.serial_number} ({eq.department || 'N/A'})
                                </option>
                            ))}
                        </select>
                        {selectedEquipment && (
                            <div className="equipment-details">
                                <small>
                                    Owner: {selectedEquipment.owner_name || 'N/A'} |
                                    Location: {selectedEquipment.location || 'N/A'}
                                </small>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Subject *</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Brief description of the maintenance work..."
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Request Type *</label>
                            <select name="request_type" value={formData.request_type} onChange={handleChange} required>
                                <option value="Corrective">Corrective</option>
                                <option value="Preventive">Preventive</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Duration (hours)</label>
                            <input
                                type="number"
                                name="duration_hours"
                                value={formData.duration_hours}
                                onChange={handleChange}
                                min="0.5"
                                step="0.5"
                                placeholder="e.g., 2.5"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Team *</label>
                            <select name="team" value={formData.team} onChange={handleChange} required>
                                <option value="">Select team</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>{team.team_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Technician</label>
                            <select name="technician" value={formData.technician} onChange={handleChange}>
                                <option value="">Unassigned</option>
                                {filteredTechnicians.map(tech => (
                                    <option key={tech.id} value={tech.user.id}>
                                        {tech.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {user && user.role === 'manager' && (
                        <div className="form-group">
                            <label>Client (Request For)</label>
                            <select name="client" value={formData.client} onChange={handleChange}>
                                <option value="">Select client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.user.id}>
                                        {client.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Scheduled Date</label>
                            <input
                                type="date"
                                name="scheduled_date"
                                value={formData.scheduled_date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Due Date</label>
                            <input
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewRequestModal;
