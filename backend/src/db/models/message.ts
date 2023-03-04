/** @module Models/Message */
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	Relation
} from "typeorm";
import { SoftDeleteQueryBuilder } from "typeorm/query-builder/SoftDeleteQueryBuilder";
import { User } from "./user";

/**
 * Message model - This is for interacting with the message table
 * Each message consists of a sender, a recipient, and a message.
 * Senders and recipients are users.
 */
@Entity()
export class Message extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne((type) => User, (sender: User) => sender.sent, {
		// Create a user if you start with a message
		cascade: ["insert"],
		// if we delete a User, also delete their Messages
		onDelete: "CASCADE"
	})
	sender!: Relation<User>;

	@ManyToOne((type) => User, (recipient: User) => recipient.inbox, {
		// Create a user if you start with a Message
		cascade: ["insert"],
		// if we delete a User, also delete their Messages
		onDelete: "CASCADE"
	})
	recipient!: Relation<User>;

	@Column('text')
	message!: string;

	@CreateDateColumn()
	created_at!: string;

	// "Soft-delete" by setting time of "deletion"
	@DeleteDateColumn()
	deleted_at?: string;
}

/*
TINDER: you are profile1
when you swipe-right on another profile, say profile2
> Create a new Message row in the Message table and set its matching_profile to our user

if someone else swipes right on YOUR profile, again, profile1
> Create a new match row in the match table and set its matched_Profile to our user

 */
