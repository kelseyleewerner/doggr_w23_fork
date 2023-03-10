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

export type AuthContextProps = {
	token: string | null,
	handleLogin: (email: string, password: string) => Promise<void>,
	handleLogout: () => void,
}
