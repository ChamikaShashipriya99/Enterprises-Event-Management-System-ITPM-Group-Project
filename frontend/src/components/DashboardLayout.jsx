import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const DashboardLayout = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
