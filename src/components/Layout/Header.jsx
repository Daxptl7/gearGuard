import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Settings, User, Moon, Sun } from 'lucide-react';
import './Header.css';

const Header = () => {
    const { getStatusCounts, notifications, markNotificationAsRead, theme, toggleTheme } = useApp();
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);
    const stats = getStatusCounts();
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleNotificationClick = (id) => {
        markNotificationAsRead(id);
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">

                    <div className="header-text">
                        <h1 className="app-title">GearGuard</h1>
                        <span className="app-subtitle">The Ultimate Maintenance Tracker</span>
                    </div>
                </div>

                <div className="header-stats">
                    <div className="stat-card">
                        <span className="stat-label">Total Requests</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">In Progress</span>
                        <span className="stat-value stat-warning">{stats.inProgress}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Overdue</span>
                        <span className="stat-value stat-danger">{stats.overdue}</span>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="notification-container">
                        <button
                            className="icon-btn"
                            title="Notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </button>

                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && <span className="badge-pill">{unreadCount} new</span>}
                                </div>
                                <div className="notification-list">
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                                onClick={() => handleNotificationClick(notification.id)}
                                            >
                                                <div className="notification-icon">
                                                    <Bell size={16} />
                                                </div>
                                                <div className="notification-content">
                                                    <p>{notification.message}</p>
                                                    <span className="notification-time">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {!notification.is_read && <div className="unread-dot"></div>}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-notifications">
                                            <p>No notifications</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="notification-container">
                        <button
                            className="icon-btn"
                            title="Settings"
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <Settings size={20} />
                        </button>

                        {showSettings && (
                            <div className="notification-dropdown settings-dropdown">
                                <div className="notification-header">
                                    <h3>Settings</h3>
                                </div>
                                <div className="settings-list">
                                    <button className="settings-item" onClick={toggleTheme}>
                                        <div className="notification-icon">
                                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                        </div>
                                        <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="icon-btn user-btn" title="Profile">
                        <User size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
