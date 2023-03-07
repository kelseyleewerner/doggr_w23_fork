import './App.css';
import {Link, Route, Routes} from 'react-router-dom';
import Home from './components/Home';
import Match from './components/Match';
import {createContext, useEffect, useState} from "react";
import {Login} from "./components/Login";
import {AuthProvider, getLoginTokenFromServer} from "./services/AuthService";


function App() {

	return (
		<AuthProvider>
			<div className="App">
				<nav>
					<div className="menu">
						<Link to="/">Home</Link>
						<Link to="/match">Match</Link>
						<Link to="/login">Login</Link>
					</div>
				</nav>
				<Routes> <Route path="/match" element={<Match/>}/>
					<Route path="/login" element={<Login/>}/>
					<Route path="/" element={<Home/>}/>
				</Routes></div>
		</AuthProvider>);
}

export default App;
