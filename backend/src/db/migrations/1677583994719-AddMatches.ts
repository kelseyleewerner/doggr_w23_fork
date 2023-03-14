import TypeORM from "typeorm";

export class AddMatches1677583994719 implements TypeORM.MigrationInterface {
    name = 'AddMatches1677583994719';

    public async up(queryRunner: TypeORM.QueryRunner): Promise<void> {
    	await queryRunner.query(`CREATE TABLE "match" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "matcherId" integer NOT NULL, "matcheeId" integer, CONSTRAINT "PK_92b6c3a6631dd5b24a67c69f69d" PRIMARY KEY ("id"))`);
    	await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_80e61381b28b6b6dd958c13be6d" FOREIGN KEY ("matcherId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    	await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_d5b0c1cdda6e33736477797ea70" FOREIGN KEY ("matcheeId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: TypeORM.QueryRunner): Promise<void> {
    	await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_d5b0c1cdda6e33736477797ea70"`);
    	await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_80e61381b28b6b6dd958c13be6d"`);
    	await queryRunner.query(`DROP TABLE "match"`);
    }

}
