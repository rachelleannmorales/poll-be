import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVoteTable1747825484774 implements MigrationInterface {
    name = 'CreateVoteTable1747825484774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vote" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "optionIndex" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "voterHash" character varying NOT NULL, "pollId" integer, CONSTRAINT "UQ_f0c6511cedb4ec1993e5e235317" UNIQUE ("pollId", "voterHash"), CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_3827d62f3c37dc8a63a13c4d0da" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_3827d62f3c37dc8a63a13c4d0da"`);
        await queryRunner.query(`DROP TABLE "vote"`);
    }

}
