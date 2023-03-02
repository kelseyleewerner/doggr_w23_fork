import {useEffect} from "react";

export type ProfileProps = {
	id: number,
	imgUri: string,
	name: string,
	onLikeButtonClick: () => void,
	onPassButtonClick: () => void,
}

export function Profile(props: ProfileProps) {
	let {imgUri, name, onLikeButtonClick, onPassButtonClick} = props;

	useEffect(() => {
		console.log("Profile rerendered");
	});

	return (
		<div>
			<img src={imgUri} alt="Profile of pet"/>
			<h2>{name}</h2>
			<div>
				<button onClick={onPassButtonClick}>Pass</button>
				<button onClick={onLikeButtonClick}>Like</button>
			</div>
		</div>
	);
}
