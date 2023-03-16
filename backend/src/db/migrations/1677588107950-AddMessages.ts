import TypeORM from "typeorm";

export class AddMessages1677588107950 implements TypeORM.MigrationInterface {
    name = 'AddMessages1677588107950';

    public async up(queryRunner: TypeORM.QueryRunner): Promise<void> {
    	await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "message" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "senderId" integer, "recipientId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
    	await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    	await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_445b786f516688cf2b81b8981b6" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: TypeORM.QueryRunner): Promise<void> {
    	await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_445b786f516688cf2b81b8981b6"`);
    	await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
    	await queryRunner.query(`DROP TABLE "message"`);
    }

}
