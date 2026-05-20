-- AlterTable
CREATE SEQUENCE ticket_count_seq;
ALTER TABLE "Ticket" ALTER COLUMN "count" SET DEFAULT nextval('ticket_count_seq');
ALTER SEQUENCE ticket_count_seq OWNED BY "Ticket"."count";
