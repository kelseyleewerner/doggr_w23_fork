import {useEffect, useState} from "react";
import {httpClient} from "../services/HttpService";

export function Matches() {

	const [matches, setMatches] = useState();

	return(<>
		<MatchView matches={matches}/>
		<MatchLogic setMatches={setMatches}/>
	</>)
}

function MatchView({matches}) {
	return (
		<div>
			<h2>matches:</h2>
			{    matches && matches.length > 0 ?
				<ul>{matches.map((match) => <li key={match.id}> {match.name}: <img src={match.picture} width="64" height="64" alt="Profile picture"/> </li>)}</ul>
				: null
			}
		</div> )
}

function MatchLogic({setMatches}) {

	useEffect( () => {
		// Reminder that useEffect itself CANNOT be async!
		const fetchMatches = async() => {
			// Note we no longer have to call axios with a huge url OR worry about auth, both automated!
			const matchesRes = await httpClient.get("/matches");
			setMatches(matchesRes.data);
		};

		fetchMatches()
			.catch(console.error);
	},[]);

	return (
	<></>
	);
}
