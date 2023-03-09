import {
	Routes,
	Route,
	NavLink,
	Navigate,
	useNavigate
} from 'react-router-dom';
import { useAuth } from "../services/AuthService";

export const ProtectedRoute = ({ children }) => {
	const { token } = useAuth();

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	return children;
};
