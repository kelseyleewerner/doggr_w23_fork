import {useCallback, useContext, useEffect, useState} from "react";
import React from "react";
import {AuthContext, useAuth} from "../services/AuthService";
import {useNavigate} from "react-router-dom";

export function Login() {

	if (!AuthContext) return null;

	const {handleLogin} = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitFailed, setSubmitFailed] = useState(false);

	const onSubmitLogin = (event) => {
		event.preventDefault();
		handleLogin(email, password);
	};

	return (
		<div>
			<div>Login</div>
			<div>    {submitFailed ? (
					<div>Your password or email was incorrect!</div>
				)
				: null}
			</div>
			<div><label htmlFor="email">Email: </label>

				<input type="text"
							 id="email"
							 required
							 value={email}
							 onChange={e => setEmail(e.target.value)}
							 name="email"
				/>
			</div>
			<div><label htmlFor="password">Password: </label>
				<input type="text"
							 id="password"
							 required
							 value={password}
							 onChange={e => setPassword(e.target.value)}
							 name="password"
				/>
			</div>
			<div>
				<button onClick={onSubmitLogin}>
					Submit
				</button>
			</div>
		</div>);
}

export function Logout() {
	// @ts-ignore
	const {handleLogout} = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		handleLogout();
		navigate("/");
	})

	return(<></>)
}

