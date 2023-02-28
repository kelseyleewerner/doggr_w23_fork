/** @module Models/Match */
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity, JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	Relation
} from "typeorm";
import {User} from "./user";
import {Profile} from "./profile";

/**
 * Match model - This is for interacting with the Match table
 * Each Match corresponds to exactly 1 pet owned by a User.
 * This allows each user to have many pet Matchs without needing to create more accounts
 */
@Entity()
export class Match extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne((type) => Profile, (profile: Profile) => profile.matches, {
		//No sense having a match without a matchee, right?
		nullable: false
	})
	matcher: Relation<Profile>;

	@ManyToOne((type) => Profile, (profile: Profile) => profile.matches)
	matchee!: Relation<Profile>; // The ! is Typescript's non-nullable operator and works like nullable: false above

	@CreateDateColumn()
	created_at: string;

	@DeleteDateColumn()
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
