import {Link, Route, Routes} from "react-router-dom";
import {useAuth} from "../services/AuthService";
import {ProtectedRoute} from "./ProtectedRoute";
import Match from "./Match";
import {Login, Logout} from "./Login";
import Home from "./Home";
import {Matches} from "./Matches";
import {CreateProfile} from "./CreateProfile";

export function NavMain() {
	return (
		<>
			<NavView/>
			<NavRoutes/>
		</>
	);
}

function NavView() {
	const {token} = useAuth();
	return (
		<nav>
			<div className="menu">
				<PublicLinksView/>
				{
					token ?
						  <AuthLinksView />
						: <NoAuthLinksView/>
				}
			</div>
		</nav>
	);
}

function PublicLinksView() {
	return (
		<>
			<Link to="/">Home</Link>
		</>
	)
}

function AuthLinksView() {
	return (
		<>
			<Link to="/match">Local Bois</Link>
			<Link to="/matches">Matches</Link>
			<Link to="/profile">New Profile</Link>
			<Link to="/logout">Logout</Link>
		</>
	)
}

function NoAuthLinksView() {
	return (
		<>
			<Link to="/login">Login</Link>
		</>
	)
}

function NavRoutes() {
	return (
		<Routes>
			<Route path="/match" element={<ProtectedRoute><Match/></ProtectedRoute>}/>
			<Route path="/matches" element={<ProtectedRoute><Matches/></ProtectedRoute>}/>
			<Route path="/login" element={<Login/>}/>
			<Route path="/" element={<Home/>}/>
			<Route path="/logout" element={<Logout/>}/>
			<Route path="/profile" element={<CreateProfile/>}/>
		</Routes>
	);
}
