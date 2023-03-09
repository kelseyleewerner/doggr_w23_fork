import './App.css';
import {Link, Route, Routes, useNavigate} from 'react-router-dom';
import Home from './components/Home';
import Match from './components/Match';
import {Login, Logout} from "./components/Login";
import {AuthProvider, getLoginTokenFromServer, useAuth} from "./services/AuthService";
import { ProtectedRoute } from './components/ProtectedRoute';
import {NavMain} from "./components/NavMain";


function App() {

	return (
		<AuthProvider>
			<div className="App">
				<NavMain/>
				<Routes>
					<Route path="/match" element={<ProtectedRoute><Match/></ProtectedRoute>}/>
					<Route path="/login" element={<Login/>}/>
					<Route path="/" element={<Home/>}/>
					<Route path="/logout" element={<Logout/>}/>
				</Routes></div>
		</AuthProvider>
	);
}

export default App;
