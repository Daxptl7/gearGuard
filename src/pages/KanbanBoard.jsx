import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useApp } from '../context/AppContext';
import KanbanColumn from '../components/Kanban/KanbanColumn';
import RequestCard from '../components/Kanban/RequestCard';
import NewRequestModal from '../components/Kanban/NewRequestModal';
import { Plus } from 'lucide-react';
import './KanbanBoard.css';

const KanbanBoard = () => {
    const { getRequestsByStatus, updateRequestStatus, user } = useApp();
    const [activeId, setActiveId] = useState(null);
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columns = [
        { id: 'new', title: 'New', color: '#667eea', icon: '📋' },
        { id: 'in-progress', title: 'In Progress', color: '#fbbf24', icon: '🔧' },
        { id: 'repaired', title: 'Repaired', color: '#4facfe', icon: '✅' },
        { id: 'scrap', title: 'Scrap', color: '#ff6b6b', icon: '🗑️' },
    ];

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Find which column we dropped over
            let overColumnId = columns.find((col) => col.id === over.id)?.id;

            // If not dropped directly on a column container, check if dropped on a card
            if (!overColumnId) {
                for (const col of columns) {
                    const columnRequests = getRequestsByStatus(col.id);
                    if (columnRequests.find(r => r.id === over.id)) {
                        overColumnId = col.id;
                        break;
                    }
                }
            }

            // Update status if we found a valid column
            if (overColumnId) {
                updateRequestStatus(active.id, overColumnId);
            }
        }

        setActiveId(null);
    };

    const activeRequest = activeId
        ? [...getRequestsByStatus('new'), ...getRequestsByStatus('in-progress'),
        ...getRequestsByStatus('repaired'), ...getRequestsByStatus('scrap')]
            .find((req) => req.id === activeId)
        : null;

    return (
        <div className="kanban-board">
            <div className="kanban-header">
                <div>
                    <h2>Maintenance Kanban Board</h2>
                    <p className="text-muted">Drag and drop requests to update their status</p>
                </div>
                {user && user.role === 'manager' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowNewRequestModal(true)}
                    >
                        <Plus size={20} />
                        New Request
                    </button>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-columns">
                    {columns.map((column) => {
                        const requests = getRequestsByStatus(column.id);
                        return (
                            <KanbanColumn
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                color={column.color}
                                icon={column.icon}
                                requests={requests}
                            />
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeRequest ? <RequestCard request={activeRequest} /> : null}
                </DragOverlay>
            </DndContext>

            {showNewRequestModal && (
                <NewRequestModal onClose={() => setShowNewRequestModal(false)} />
            )}
        </div>
    );
};

export default KanbanBoard;
