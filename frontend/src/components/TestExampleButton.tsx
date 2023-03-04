import {useState} from "react";

export const TestExampleButton = () => {
	let [clicks, setClicks] = useState(0);

	return (
		<button onClick={() => {
			setClicks(clicks + 1);
		}
		}>
			Clicks: {clicks}
		</button> );
}
