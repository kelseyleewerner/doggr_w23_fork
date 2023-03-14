/** @module Models/User */
import TypeORM from "typeorm";

import {IPHistory} from "./ip_history";
import {Profile} from "./profile";
import {Message} from "./message";
import {hashSync} from "bcrypt";

/**
 *  Class representing user table
 */
@TypeORM.Entity({name: "users"})
export class User extends TypeORM.BaseEntity {
	@TypeORM.PrimaryGeneratedColumn()
	id: number;

	@TypeORM.Column({
		length: 100,
		type: "varchar"
	})
	name: string;

	@TypeORM.Column('text')
	email: string;

	@TypeORM.Column({type: "text", default: hashSync("password", 2)})
	password!: string;

	// IPHistory
	@TypeORM.OneToMany((type) => IPHistory, (ip: IPHistory) => ip.user)
	ips: TypeORM.Relation<IPHistory[]>;

	// Profile
	@TypeORM.OneToMany((type) => Profile, (p: Profile) => p.user)
	profiles: TypeORM.Relation<Profile[]>;

	// Message - Sender
	@TypeORM.OneToMany((type) => Message, (ms: Message) => ms.sender)
	sent: TypeORM.Relation<Message[]>;

	// Message - Recipient
	@TypeORM.OneToMany((type) => Message, (mr: Message) => mr.recipient)
	inbox: TypeORM.Relation<Message[]>;

	@TypeORM.Column({
		default: 0
	})
	badwords!: number;

	@TypeORM.CreateDateColumn()
	created_at: string;

	@TypeORM.UpdateDateColumn()
	updated_at: string;
}
