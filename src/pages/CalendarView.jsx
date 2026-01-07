import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Plus, X, Clock, User } from 'lucide-react';
import NewRequestModal from '../components/Kanban/NewRequestModal';
import './CalendarView.css';

const CalendarView = () => {
    const { requests, technicians, selectedDate, setSelectedDate } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [selectedDayDetails, setSelectedDayDetails] = useState(null);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getRequestsForDate = (date) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        // Fix: use scheduled_date instead of scheduledDate
        return requests.filter(req => req.scheduled_date === dateStr);
    };

    const getTechnicianName = (techId) => {
        const tech = technicians.find(t => t.id === techId);
        return tech ? tech.username : 'Unassigned';
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const handleDayClick = (date) => {
        if (!date) return;
        const dayRequests = getRequestsForDate(date);
        setSelectedDayDetails({
            date,
            requests: dayRequests
        });
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = getDaysInMonth(currentDate);

    return (
        <div className="calendar-view">
            <div className="calendar-header">
                <div>
                    <h2>Calendar View</h2>
                    <p className="text-muted">Schedule and view preventive maintenance</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowNewRequestModal(true)}
                >
                    <Plus size={20} />
                    Schedule Maintenance
                </button>
            </div>

            <div className="calendar-controls">
                <button className="btn btn-secondary btn-sm" onClick={prevMonth}>
                    <ChevronLeft size={20} />
                    Previous
                </button>
                <h3>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button className="btn btn-secondary btn-sm" onClick={nextMonth}>
                    Next
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="calendar-grid">
                <div className="calendar-days-header">
                    {dayNames.map(day => (
                        <div key={day} className="calendar-day-name">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="calendar-days">
                    {days.map((date, index) => {
                        const dayRequests = date ? getRequestsForDate(date) : [];

                        return (
                            <div
                                key={index}
                                className={`calendar-day ${!date ? 'calendar-day-empty' : ''} ${isToday(date) ? 'calendar-day-today' : ''
                                    } ${dayRequests.length > 0 ? 'calendar-day-has-events' : ''}`}
                                onClick={() => handleDayClick(date)}
                            >
                                {date && (
                                    <>
                                        <div className="calendar-day-number">
                                            {date.getDate()}
                                        </div>

                                        {dayRequests.length > 0 && (
                                            <div className="calendar-events">
                                                {dayRequests.slice(0, 2).map(req => (
                                                    <div
                                                        key={req.id}
                                                        className="calendar-event"
                                                        title={`${req.equipment_name || 'Equipment'} - ${req.description}`}
                                                    >
                                                        {req.equipment_name || 'Equipment'}
                                                    </div>
                                                ))}
                                                {dayRequests.length > 2 && (
                                                    <div className="calendar-event-more">
                                                        +{dayRequests.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Day Details Modal */}
            {selectedDayDetails && (
                <div className="modal-overlay" onClick={() => setSelectedDayDetails(null)}>
                    <div className="modal-content day-details-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedDayDetails.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                            <button className="close-btn" onClick={() => setSelectedDayDetails(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {selectedDayDetails.requests.length > 0 ? (
                                <div className="day-requests-list">
                                    {selectedDayDetails.requests.map(req => (
                                        <div key={req.id} className="day-request-card">
                                            <div className="request-card-header">
                                                <span className={`status-badge status-${req.status.toLowerCase().replace(' ', '-')}`}>
                                                    {req.status}
                                                </span>
                                                <span className="request-priority">
                                                    {req.priority}
                                                </span>
                                            </div>
                                            <h4>{req.equipment_name || 'Equipment'}</h4>
                                            <p className="request-description">{req.description}</p>

                                            <div className="request-meta">
                                                <div className="meta-item">
                                                    <User size={16} />
                                                    <span>
                                                        Tech: {getTechnicianName(req.technician)}
                                                    </span>
                                                </div>
                                                <div className="meta-item">
                                                    <Clock size={16} />
                                                    <span>{req.request_type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No maintenance scheduled for this day.</p>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            setSelectedDayDetails(null);
                                            setShowNewRequestModal(true);
                                        }}
                                    >
                                        Schedule Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showNewRequestModal && (
                <NewRequestModal
                    onClose={() => setShowNewRequestModal(false)}
                    initialData={{
                        scheduled_date: new Date().toISOString().split('T')[0],
                        request_type: 'Preventive'
                    }}
                />
            )}
        </div>
    );
};

export default CalendarView;
