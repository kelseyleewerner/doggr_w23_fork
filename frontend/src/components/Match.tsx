import {useContext, useEffect, useState} from 'react';
import initialState, {getRandomProfile} from "../initialState";
import {Profile} from "./Profile";
import {Title} from "./Home";
import {AuthContext, useAuth} from "../services/AuthService";


function Match() {

	let [currentProfile, setCurrentProfile] = useState(initialState.currentProfile);
	let [likeHistory, setLikeHistory] = useState(initialState.likeHistory);

	const {token} = useAuth();

	useEffect(() => {
		console.log("-- App rerenders --");
	});

	let onLikeButtonClick = () => {
		// this keeps allocations and copies to a minimum
		let newLikeHistory = [...likeHistory, currentProfile];
		let newProfile = getRandomProfile();
		setCurrentProfile(newProfile);
		setLikeHistory(newLikeHistory);
	};

	let onPassButtonClick = () => {
		let newCurrentProfile = getRandomProfile();
		setCurrentProfile(newCurrentProfile);
	};

	let profile = <Profile {...currentProfile}
												 onLikeButtonClick={onLikeButtonClick}
												 onPassButtonClick={onPassButtonClick}/>;

	return (
		<>
			<Title/>   {profile}
			<div>Authenticated as {token}</div>
		</> );
}

export default Match;
