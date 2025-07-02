import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types';

function ProtectedRoute({ children, allowedRoles }) {
    const { auth } = useSelector((state) => state.auth);
    const user = useSelector((state) => state.auth.user);

    console.log('show user role name : ', user.role_name);
    

    if (!auth) {
        // Not authenticated
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role_name)) {
        // Authenticated but not authorized
        return <Navigate to="/403" replace />; // Or show a 403 Forbidden page
    }

    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
