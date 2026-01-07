import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, BarChart3, Package } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navItems = [
        {
            path: '/kanban',
            icon: LayoutDashboard,
            label: 'Kanban Board',
            description: 'Maintenance workflow',
        },
        {
            path: '/calendar',
            icon: Calendar,
            label: 'Calendar',
            description: 'Schedule maintenance',
        },
        {
            path: '/reports',
            icon: BarChart3,
            label: 'Reports',
            description: 'Analytics & insights',
        },
        {
            path: '/equipment',
            icon: Package,
            label: 'Equipment',
            description: 'Manage inventory',
        },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">⚙️</div>
                    <div className="logo-text">
                        <span className="logo-title">GearGuard</span>
                        <span className="logo-version">v1.0</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'nav-item-active' : ''}`
                        }
                    >
                        <item.icon size={20} className="nav-icon" />
                        <div className="nav-content">
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-description">{item.description}</span>
                        </div>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="footer-card">
                    <p className="footer-title">Need Help?</p>
                    <p className="footer-text">Contact support</p>
                    <a
                        href="mailto:daxbharatbhai30@gmail.com"
                        className="btn btn-sm btn-primary"
                        style={{ marginTop: '0.5rem', display: 'inline-flex', justifyContent: 'center', width: '100%', textDecoration: 'none' }}
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
