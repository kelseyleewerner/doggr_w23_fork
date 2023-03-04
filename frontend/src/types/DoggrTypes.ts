export type State = {
	currentProfile: ProfileType,
	likeHistory: Array<ProfileType>,
};

export type ProfileType = {
	imgUri: string,
	thumbUri: string,
	name: string,
	id: number,
}
