import {httpClient} from "./HttpService";
import {createContext, useContext, useState} from "react";

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
	const [token, setToken] = useState<string>("");


	const handleLogin = async (email, password) => {
		const newToken = await getLoginTokenFromServer(email, password);
		console.log("GOT A NEW TOKEN! " + newToken);
		setToken(newToken);
	};

	const handleLogout = () => {
		setToken("");
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
