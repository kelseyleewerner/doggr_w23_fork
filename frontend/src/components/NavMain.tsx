import {Link} from "react-router-dom";
import {useAuth} from "../services/AuthService";

export function NavMain() {
	const {token} = useAuth();

	// Note below that a ternary comparison in JS against `token` as a string will evaluate
	// to FALSE for all 3 cases: string is null, string is undefined, string is empty ("")
	return (
		<nav>
			<div className="menu">
				<Link to="/">Home</Link>
				{
					token  ?
					<><Link to="/match">Match</Link>
						<Link to="/logout">Logout</Link>
					</>
					: <Link to="/login">Login</Link>
				}
			</div>
		</nav>
	);
}
