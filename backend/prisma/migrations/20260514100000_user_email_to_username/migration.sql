-- 로그인 식별자: email 컬럼을 username으로 변경
ALTER TABLE "User" RENAME COLUMN "email" TO "username";
ALTER INDEX "User_email_key" RENAME TO "User_username_key";

-- 기존 시드 이메일 형식 값을 아이디로 정리
UPDATE "User" SET "username" = 'admin' WHERE "username" = 'admin@nugabox.local';
UPDATE "User" SET "username" = 'member1' WHERE "username" = 'member1@nugabox.local';
UPDATE "User" SET "username" = 'member2' WHERE "username" = 'member2@nugabox.local';
