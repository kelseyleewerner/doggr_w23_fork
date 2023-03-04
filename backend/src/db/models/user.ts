/** @module Models/User */
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	Relation,
	UpdateDateColumn
} from "typeorm";

import {IPHistory} from "./ip_history";
import {Profile} from "./profile";
import {Message} from "./message";

/**
 *  Class representing user table
 */
@Entity({name: "users"})
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		length: 100,
		type: "varchar"
	})
	name: string;

	@Column('text')
	email: string;

	// IPHistory
	@OneToMany((type) => IPHistory, (ip: IPHistory) => ip.user)
	ips: Relation<IPHistory[]>;

	// Profile
	@OneToMany((type) => Profile, (p: Profile) => p.user)
	profiles: Relation<Profile[]>;

	// Message - Sender
	@OneToMany((type) => Message, (ms: Message) => ms.sender)
	sent: Relation<Message[]>;

	// Message - Recipient
	@OneToMany((type) => Message, (mr: Message) => mr.recipient)
	inbox: Relation<Message[]>;

	@Column({
		default: 0
	})
	badwords!: number;

	@CreateDateColumn()
	created_at: string;

	@UpdateDateColumn()
	updated_at: string;
}
