import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../../context/AppContext';
import { Calendar, AlertCircle, User } from 'lucide-react';
import './RequestCard.css';

const RequestCard = ({ request }) => {
    const { isRequestOverdue, updateRequestStatus } = useApp();
    const [showCompleteMenu, setShowCompleteMenu] = React.useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: request.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const isOverdue = isRequestOverdue(request);

    const typeColors = {
        'Corrective': '#ff6b6b',
        'Preventive': '#4facfe',
    };

    const handleAction = (e, newStatus) => {
        e.stopPropagation(); // Prevent drag start
        e.preventDefault();
        updateRequestStatus(request.id, newStatus);
        setShowCompleteMenu(false);
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setShowCompleteMenu(!showCompleteMenu);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`request-card ${isOverdue ? 'request-card-overdue' : ''}`}
        >
            <div className="card-header">
                <div className="card-priority" style={{ backgroundColor: typeColors[request.request_type] }}>
                    {request.request_type}
                </div>
                {isOverdue && (
                    <div className="overdue-badge">
                        <AlertCircle size={14} />
                        Overdue
                    </div>
                )}
            </div>

            <h4 className="card-equipment">{request.equipment_name}</h4>
            <p className="card-description">{request.subject}</p>

            {request.equipment_serial && (
                <p className="card-serial">SN: {request.equipment_serial}</p>
            )}

            <div className="card-footer">
                <div className="card-date">
                    <Calendar size={14} />
                    <span>
                        {request.scheduled_date
                            ? new Date(request.scheduled_date).toLocaleDateString()
                            : 'Not scheduled'}
                    </span>
                </div>

                {request.technician_name ? (
                    <div className="card-technician">
                        <div className="avatar avatar-sm">
                            {request.technician_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{request.technician_name}</span>
                    </div>
                ) : (
                    <div className="card-unassigned">
                        <User size={14} />
                        <span>Unassigned</span>
                    </div>
                )}
            </div>

            {request.duration_hours && (
                <div className="duration-indicator">⏱️ {request.duration_hours}h</div>
            )}

            {/* Action Buttons */}
            <div className="card-actions">
                {request.status === 'New' && (
                    <button
                        className="action-btn btn-start"
                        onPointerDown={(e) => handleAction(e, 'in-progress')}
                    >
                        Start Work
                    </button>
                )}

                {request.status === 'In Progress' && (
                    <div className="action-menu-container">
                        <button
                            className="action-btn btn-complete"
                            onPointerDown={toggleMenu}
                        >
                            Complete
                        </button>

                        {showCompleteMenu && (
                            <div className="action-menu">
                                <button
                                    className="menu-item success"
                                    onPointerDown={(e) => handleAction(e, 'repaired')}
                                >
                                    ✅ Repaired
                                </button>
                                <button
                                    className="menu-item danger"
                                    onPointerDown={(e) => handleAction(e, 'scrap')}
                                >
                                    🗑️ Scrap
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestCard;
