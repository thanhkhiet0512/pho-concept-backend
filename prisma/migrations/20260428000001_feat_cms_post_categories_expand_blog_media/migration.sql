-- AlterEnum
ALTER TYPE "BlogPostStatus" ADD VALUE 'SCHEDULED';

-- CreateTable
CREATE TABLE "post_categories" (
    "post_category_id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "name_i18n" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_categories_pkey" PRIMARY KEY ("post_category_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_categories_slug_key" ON "post_categories"("slug");

-- CreateIndex
CREATE INDEX "post_categories_is_active_idx" ON "post_categories"("is_active");

-- CreateIndex
CREATE INDEX "post_categories_sort_order_idx" ON "post_categories"("sort_order");

-- AlterTable: expand blog_posts
ALTER TABLE "blog_posts"
  ADD COLUMN "author"             VARCHAR(255),
  ADD COLUMN "category_id"        BIGINT,
  ADD COLUMN "external_link"      VARCHAR(500),
  ADD COLUMN "gallery_image_ids"  JSONB,
  ADD COLUMN "is_featured"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "read_time"          VARCHAR(50),
  ADD COLUMN "video_url"          VARCHAR(500),
  ADD COLUMN "views"              VARCHAR(50);

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_category_id_idx" ON "blog_posts"("category_id");

-- CreateIndex
CREATE INDEX "blog_posts_is_featured_idx" ON "blog_posts"("is_featured");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "post_categories"("post_category_id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: expand media_files
ALTER TABLE "media_files"
  ADD COLUMN "deleted_at" TIMESTAMP(3),
  ADD COLUMN "folder"     VARCHAR(255),
  ADD COLUMN "title"      VARCHAR(255);

-- CreateIndex
CREATE INDEX "media_files_folder_idx" ON "media_files"("folder");

-- CreateIndex
CREATE INDEX "media_files_deleted_at_idx" ON "media_files"("deleted_at");
