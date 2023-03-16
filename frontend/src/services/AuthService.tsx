import {httpClient, updateAxios} from "./HttpService";
import {createContext, useContext, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContextProps} from "../types/DoggrTypes";

// This is how we initially retrieve a token from storing it due to a prior login
// We pass it to AuthProvider as token's initial useState()
const initialToken = getTokenFromStorage();

/* This is NOTHING but a normal React component!
The {children} arg, remember, is simply a placeholder for ALL child components.
We are wanting EVERY child component to be able to access Auth, so this is perfect for our needs.
 */
export const AuthProvider = ({children}) => {
	// React-router-dom's utility for being able to programmatically send a user to a different page
	const navigate = useNavigate();

	// Our actual JWT token, received from logging in.  Auth owns it and gives access to its child components.
	// Note that it is one of the "things" packaged and returned in useAuthContextPackage below
	const [token, setToken] = useState<string>(initialToken!);

	// This, like our token, is something we make available to ALL child components.
	// This is the function our components can retrieve and call from useAuth() to log a user in based on their email/password
	// Note that it is one of the "things" packaged and returned in useAuthContextPackage below
	const handleLogin = async (email: string, password: string) => {
		const newToken = await getLoginTokenFromServer(email, password);
		// Now we have a new token from our backend and need to update all aspects of our app
		await saveToken(newToken);
		navigate(-1);
	};

	// This is the function our components can retrieve and call from useAuth() to log a user out
	// Note that it is one of the "things" packaged and returned in useAuthContextPackage below
	const handleLogout = async () => {
		// Note JS has 3 potentially usable but DIFFERENT values for "null or empty string" => null/undefined/""
		await saveToken(null);
		// Once a user has logged out, send them straight back to our homepage
		navigate('/');
	};

	// This performs all necessary state updates when we've received a new token
	// Note that the absence of a token is considered a "new" one too, so we call this during log OUT as well!
	const saveToken =  async (token: string) => {
		// Update our Auth's "OWNED" single-source-of-truth token
		setToken(token);

		// Save said token into Local Storage so we can retrieve it later if a user returns to our site
		localStorage.setItem("token", JSON.stringify(token));

		// update Axios with the new token so we can continue making authenticated requests to our backend automatically
		await updateAxios(token);
	};

	// These are all the "things" we want to make available in our useAuth() hook
	const useAuthContextPackage = {
		// Our JWT token itself
		token,
		// The function our React components can call to log in
		handleLogin,
		// The function our React components call to trigger a complete logout of the site
		handleLogout,
	};

	// This is HOW we make those things available to children in useAuth()
	return (
		<AuthContext.Provider value={useAuthContextPackage}>
			{children}
		</AuthContext.Provider>);
};



/**
	This fn will use our HttpService.tsx axios impl to send the user's email and password to /login ON OUR BACKEND
 */
async function getLoginTokenFromServer(email: string, password: string) {
	console.log("In get login token from server", email, password);
	let res = await httpClient.post("/login", {
		email,
		password
	});

	return res.data.token;
}


/** This checks to see if we've previously logged in and stored a token
   inside our browser's Local Storage (hint: Open browser dev tools and look in the Storage tab!)
 */
function getTokenFromStorage() {
	const tokenString = localStorage.getItem('token');
	if ( tokenString == null) {
		return null;
	}
	const userToken = JSON.parse(tokenString);
	return userToken?.token;
}

// This is a single abstraction layer to tuck away the creation of the React context itself
export const AuthContext = createContext<AuthContextProps | null>(null);

// This is a SECOND abstraction layer to also tuck away the usage of the Context
// Note this is the ONLY export from all of Auth except for the Provider component itself
// This is because of our abstraction layers
export const useAuth = () => {
	return useContext(AuthContext);
}
