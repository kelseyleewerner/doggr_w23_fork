import axios from "axios";

// @ts-ignore
const serverIP = import.meta.env.VITE_BACKEND_IP;
// @ts-ignore
const serverPort = import.meta.env.VITE_BACKEND_PORT;

const serverUrl = `http://${serverIP}:${serverPort}`;

// This is why I use Axios over Fetch
export const httpClient = axios.create({
	baseURL: serverUrl,
	headers: {
		"Content-type": "application/json"
	}
});
