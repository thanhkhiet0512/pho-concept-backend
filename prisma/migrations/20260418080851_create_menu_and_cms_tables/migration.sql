-- CreateEnum (safe: skip if already exists)
DO $$ BEGIN
  CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventType" AS ENUM ('PROMOTION', 'HOLIDAY', 'SPECIAL_EVENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterEnum (safe: skip if already done)
DO $$ BEGIN
  CREATE TYPE "AdminRole_new" AS ENUM ('owner', 'manager', 'staff', 'view_only');
  ALTER TABLE "admin_users" ALTER COLUMN "role" TYPE "AdminRole_new" USING ("role"::text::"AdminRole_new");
  ALTER TYPE "AdminRole" RENAME TO "AdminRole_old";
  ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
  DROP TYPE "public"."AdminRole_old";
EXCEPTION WHEN duplicate_object THEN NULL;
         WHEN undefined_object THEN NULL;
END $$;

-- DropForeignKey (safe)
ALTER TABLE "customer_addresses" DROP CONSTRAINT IF EXISTS "fk_customer_addresses_customer";
ALTER TABLE "customer_addresses" DROP CONSTRAINT IF EXISTS "customer_addresses_customer_id_fkey";

-- AlterTable customer_addresses (safe)
ALTER TABLE "customer_addresses"
  ALTER COLUMN "is_default" SET NOT NULL,
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
  ALTER COLUMN "updated_at" SET NOT NULL,
  ALTER COLUMN "updated_at" DROP DEFAULT,
  ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable locations
ALTER TABLE "locations" ALTER COLUMN "timezone" SET DEFAULT 'America/Los_Angeles';

-- CreateTable blog_posts
CREATE TABLE IF NOT EXISTS "blog_posts" (
    "blog_post_id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title_i18n" JSONB NOT NULL,
    "content_i18n" JSONB NOT NULL,
    "excerpt_i18n" JSONB,
    "meta_description_i18n" JSONB,
    "cover_image_url" VARCHAR(500),
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("blog_post_id")
);

-- CreateTable cms_pages
CREATE TABLE IF NOT EXISTS "cms_pages" (
    "cms_page_id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title_i18n" JSONB NOT NULL,
    "meta_description_i18n" JSONB,
    "og_image_url" VARCHAR(500),
    "sections" JSONB NOT NULL DEFAULT '[]',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("cms_page_id")
);

-- CreateTable events
CREATE TABLE IF NOT EXISTS "events" (
    "event_id" BIGSERIAL NOT NULL,
    "title_i18n" JSONB NOT NULL,
    "description_i18n" JSONB,
    "cover_image_url" VARCHAR(500),
    "event_date" DATE NOT NULL,
    "event_end_date" DATE,
    "event_type" "EventType" NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable media_files
CREATE TABLE IF NOT EXISTS "media_files" (
    "media_file_id" BIGSERIAL NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "r2_key" VARCHAR(1000) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "alt_text_i18n" JSONB,
    "uploaded_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("media_file_id")
);

-- CreateTable menu_categories
CREATE TABLE IF NOT EXISTS "menu_categories" (
    "menu_category_id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_i18n" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("menu_category_id")
);

-- CreateTable menu_items
CREATE TABLE IF NOT EXISTS "menu_items" (
    "menu_item_id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_i18n" JSONB NOT NULL,
    "description_i18n" JSONB,
    "image_url" VARCHAR(500),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("menu_item_id")
);

-- CreateTable menu_item_prices
CREATE TABLE IF NOT EXISTS "menu_item_prices" (
    "menu_item_price_id" BIGSERIAL NOT NULL,
    "menu_item_id" BIGINT NOT NULL,
    "location_id" BIGINT NOT NULL,
    "size_label" VARCHAR(50),
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_prices_pkey" PRIMARY KEY ("menu_item_price_id")
);

-- CreateIndex (safe)
CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_key" ON "blog_posts"("slug");
CREATE INDEX IF NOT EXISTS "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at");
CREATE UNIQUE INDEX IF NOT EXISTS "cms_pages_slug_key" ON "cms_pages"("slug");
CREATE INDEX IF NOT EXISTS "cms_pages_is_published_idx" ON "cms_pages"("is_published");
CREATE INDEX IF NOT EXISTS "events_event_date_is_active_idx" ON "events"("event_date", "is_active");
CREATE INDEX IF NOT EXISTS "events_is_featured_idx" ON "events"("is_featured");
CREATE UNIQUE INDEX IF NOT EXISTS "media_files_r2_key_key" ON "media_files"("r2_key");
CREATE INDEX IF NOT EXISTS "media_files_uploaded_by_idx" ON "media_files"("uploaded_by");
CREATE INDEX IF NOT EXISTS "media_files_mime_type_idx" ON "media_files"("mime_type");
CREATE UNIQUE INDEX IF NOT EXISTS "menu_categories_slug_key" ON "menu_categories"("slug");
CREATE INDEX IF NOT EXISTS "menu_categories_is_active_sort_order_idx" ON "menu_categories"("is_active", "sort_order");
CREATE UNIQUE INDEX IF NOT EXISTS "menu_items_slug_key" ON "menu_items"("slug");
CREATE INDEX IF NOT EXISTS "menu_items_category_id_idx" ON "menu_items"("category_id");
CREATE INDEX IF NOT EXISTS "menu_items_is_active_deleted_at_idx" ON "menu_items"("is_active", "deleted_at");
CREATE INDEX IF NOT EXISTS "menu_items_is_featured_idx" ON "menu_items"("is_featured");
CREATE INDEX IF NOT EXISTS "menu_item_prices_menu_item_id_idx" ON "menu_item_prices"("menu_item_id");
CREATE INDEX IF NOT EXISTS "menu_item_prices_location_id_idx" ON "menu_item_prices"("location_id");
CREATE UNIQUE INDEX IF NOT EXISTS "menu_item_prices_menu_item_id_location_id_size_label_key" ON "menu_item_prices"("menu_item_id", "location_id", "size_label");

-- AddForeignKey (safe)
ALTER TABLE "customer_addresses" DROP CONSTRAINT IF EXISTS "customer_addresses_customer_id_fkey";
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menu_items" DROP CONSTRAINT IF EXISTS "menu_items_category_id_fkey";
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("menu_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "menu_item_prices" DROP CONSTRAINT IF EXISTS "menu_item_prices_menu_item_id_fkey";
ALTER TABLE "menu_item_prices" ADD CONSTRAINT "menu_item_prices_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("menu_item_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menu_item_prices" DROP CONSTRAINT IF EXISTS "menu_item_prices_location_id_fkey";
ALTER TABLE "menu_item_prices" ADD CONSTRAINT "menu_item_prices_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE CASCADE ON UPDATE CASCADE;
