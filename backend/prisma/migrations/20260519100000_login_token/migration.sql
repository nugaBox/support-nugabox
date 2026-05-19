-- CreateTable
CREATE TABLE "LoginToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "LoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoginToken_user_id_key" ON "LoginToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "LoginToken_token_hash_key" ON "LoginToken"("token_hash");

-- CreateIndex
CREATE INDEX "LoginToken_user_id_idx" ON "LoginToken"("user_id");

-- AddForeignKey
ALTER TABLE "LoginToken" ADD CONSTRAINT "LoginToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
