/** @module Models/Match */
import TypeORM from "typeorm";
import {User} from "./user";
import {Profile} from "./profile";

/**
 * Match model - This is for interacting with the Match table
 * Each Match corresponds to exactly 1 pet owned by a User.
 * This allows each user to have many pet Matchs without needing to create more accounts
 */
@TypeORM.Entity()
export class Match extends TypeORM.BaseEntity {
	@TypeORM.PrimaryGeneratedColumn()
	id: number;

	@TypeORM.ManyToOne((type) => Profile, (profile: Profile) => profile.matches, {
		//No sense having a match without a matchee, right?
		nullable: false,

		// if we delete a User, also delete their Messages
		onDelete: "CASCADE"
	})
	matcher: TypeORM.Relation<Profile>;

	@TypeORM.ManyToOne((type) => Profile, (profile: Profile) => profile.matches, {

		// if we delete a User, also delete their Messages
		onDelete: "CASCADE"
	})
	matchee!: TypeORM.Relation<Profile>; // The ! is Typescript's non-nullable operator and works like nullable: false above

	@TypeORM.CreateDateColumn()
	created_at: string;

	@TypeORM.DeleteDateColumn()
	deleted_at?: string;
}

export function MatchBuilder(matcher: Profile, matchee: Profile): Match {
	let myMatch = new Match();
	myMatch.matcher = matcher;
	myMatch.matchee = matchee;
	return myMatch;
}

/*
TINDER: you are Match1
when you swipe-right on another Match, say Match2
> Create a new Match row in the Match table and set its matching_Match to our user

if someone else swipes right on YOUR Match, again, Match1
> Create a new match row in the match table and set its matched_Match to our user

 */
