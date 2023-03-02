export type State = {
	currentProfile: Profile,
	likeHistory: Array<Profile>,
	passHistory: Array<Profile>,
};

export type Profile = {
	imgUri: string,
	thumbUri: string,
	name: string,
	id: number,
}
