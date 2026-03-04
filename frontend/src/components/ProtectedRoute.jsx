import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { currentUser, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (role && currentUser.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
