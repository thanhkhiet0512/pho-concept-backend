-- AlterTable
ALTER TABLE "catering_requests" ALTER COLUMN "token" SET DEFAULT gen_random_uuid()::text;

-- CreateTable
CREATE TABLE "media_folders" (
    "media_folder_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("media_folder_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_folders_slug_key" ON "media_folders"("slug");

-- CreateIndex
CREATE INDEX "media_folders_slug_idx" ON "media_folders"("slug");
