import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePollTable1747822524987 implements MigrationInterface {
    name = 'CreatePollTable1747822524987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "polls" ("id" SERIAL NOT NULL, "question" text NOT NULL, "options" text array NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b9bbb8fc7b142553c518ddffbb6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "polls"`);
    }

}
