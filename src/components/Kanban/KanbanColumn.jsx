import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import RequestCard from './RequestCard';
import './KanbanColumn.css';

const KanbanColumn = ({ id, title, color, icon, requests }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}
            style={{ '--column-color': color }}
        >
            <div className="column-header">
                <div className="column-title">
                    <span className="column-icon">{icon}</span>
                    <span>{title}</span>
                </div>
                <span className="column-count">{requests.length}</span>
            </div>

            <div className="column-content">
                <SortableContext items={requests.map(r => r.id)} strategy={verticalListSortingStrategy}>
                    {requests.map((request) => (
                        <RequestCard key={request.id} request={request} />
                    ))}
                </SortableContext>

                {requests.length === 0 && (
                    <div className="empty-column">
                        <p>No requests</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
