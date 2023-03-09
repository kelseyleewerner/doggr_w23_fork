import {httpClient} from "./HttpService";
import {createContext, useContext, useState} from "react";
import { useNavigate } from "react-router-dom";

export function getTokenFromStorage() {
	const tokenString = localStorage.getItem('token');
	if ( tokenString == null) {
		return null;
	}
	const userToken = JSON.parse(tokenString);
	return userToken?.token;
}

const initialToken = getTokenFromStorage();

export type AuthContextProps = {
	token: string | null,
	handleLogin: (email: string, password: string) => Promise<void>,
	handleLogout: () => void,
}

export const useAuth = () => {
	return useContext(AuthContext);
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({children}) => {
	const navigate = useNavigate();
	const [token, setToken] = useState<string>(initialToken!);


	const handleLogin = async (email: string, password: string) => {
		const newToken = await getLoginTokenFromServer(email, password);
		console.log("GOT A NEW TOKEN! " + newToken);
		setToken(newToken);
		await updateAxios(newToken);
		navigate(-1);
	};

	const handleLogout = () => {
		setToken("");

		navigate('/');
	};


	const saveToken =  (token: string) => {
		console.log("Saving token");
		setToken(token);
		localStorage.setItem("token", JSON.stringify(token));
	};

	const value = {
		token,
		handleLogin,
		handleLogout,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>);
};

export async function getLoginTokenFromServer(email: string, password: string) {
	console.log("In get login token from server", email, password);
	let res = await httpClient.post("/login", {
		email,
		password
	});

	return res.data.token;
}

const updateAxios = async(token: string) => {
	console.log("In update axios");
	httpClient.interceptors.request.use(
		async config => {

			// @ts-ignore
			config.headers = {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json',
			};

			return config;
		},
		error => {
			console.log("REJECTED PROMISE");
			Promise.reject(error);
		});
}
