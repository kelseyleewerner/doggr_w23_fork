import {AuthProvider} from "./services/AuthService";
import {NavMain} from "./components/NavMain";

// Note this is APP SPECIFIC css not included in our sitewide index.css
import './App.css';

export default function App() {
	return (
		<AuthProvider>
			<div className="App">
				<NavMain/>
			</div>
		</AuthProvider>
	);
}
