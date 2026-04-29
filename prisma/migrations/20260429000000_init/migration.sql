-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('owner', 'manager', 'staff', 'view_only');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PROMOTION', 'HOLIDAY', 'SPECIAL_EVENT');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CateringStatus" AS ENUM ('INQUIRY', 'QUOTED', 'DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "admin_users" (
    "admin_user_id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("admin_user_id")
);

-- CreateTable
CREATE TABLE "catering_items" (
    "item_id" BIGSERIAL NOT NULL,
    "catering_request_id" BIGINT NOT NULL,
    "menu_item_id" BIGINT,
    "custom_name" VARCHAR(255),
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "note" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catering_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "catering_packages" (
    "package_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description_i18n" JSONB NOT NULL,
    "min_guests" INTEGER NOT NULL,
    "max_guests" INTEGER NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "includes_i18n" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catering_packages_pkey" PRIMARY KEY ("package_id")
);

-- CreateTable
CREATE TABLE "catering_requests" (
    "request_id" BIGSERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::text,
    "location_id" BIGINT NOT NULL,
    "package_id" BIGINT,
    "contact_name" VARCHAR(255) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "event_date" DATE NOT NULL,
    "event_time" VARCHAR(5) NOT NULL,
    "guest_count" INTEGER NOT NULL,
    "venue" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "zip" VARCHAR(20),
    "dietary_notes" TEXT,
    "special_request" TEXT,
    "status" "CateringStatus" NOT NULL DEFAULT 'INQUIRY',
    "quoted_amount" DECIMAL(10,2),
    "deposit_amount" DECIMAL(10,2),
    "deposit_paid_at" TIMESTAMP(3),
    "stripe_payment_intent" VARCHAR(255),
    "quotation_deadline" TIMESTAMP(3),
    "internal_note" TEXT,
    "handled_by_admin_id" BIGINT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catering_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "blog_post_id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title_i18n" JSONB NOT NULL,
    "content_i18n" JSONB NOT NULL,
    "excerpt_i18n" JSONB,
    "meta_description_i18n" JSONB,
    "cover_image_url" VARCHAR(500),
    "gallery_image_ids" JSONB,
    "author" VARCHAR(255),
    "external_link" VARCHAR(500),
    "video_url" VARCHAR(500),
    "read_time" VARCHAR(50),
    "views" VARCHAR(50),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "category_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("blog_post_id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
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

-- CreateTable
CREATE TABLE "events" (
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

-- CreateTable
CREATE TABLE "media_files" (
    "media_file_id" BIGSERIAL NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255),
    "r2_key" VARCHAR(1000) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "alt_text_i18n" JSONB,
    "folder" VARCHAR(255),
    "uploaded_by" BIGINT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("media_file_id")
);

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

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "customer_address_id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip" VARCHAR(20) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("customer_address_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "location_id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip" VARCHAR(20) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Los_Angeles',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "location_hours" (
    "location_hour_id" BIGSERIAL NOT NULL,
    "location_id" BIGINT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" VARCHAR(5) NOT NULL,
    "close_time" VARCHAR(5) NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_hours_pkey" PRIMARY KEY ("location_hour_id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "menu_category_id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_i18n" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("menu_category_id")
);

-- CreateTable
CREATE TABLE "menu_items" (
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

-- CreateTable
CREATE TABLE "menu_item_prices" (
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

-- CreateTable
CREATE TABLE "notification_logs" (
    "log_id" BIGSERIAL NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500),
    "template" VARCHAR(100) NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "error" TEXT,
    "metadata" JSONB,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "reservation_slot_configs" (
    "slot_config_id" BIGSERIAL NOT NULL,
    "location_id" BIGINT NOT NULL,
    "slot_duration" INTEGER NOT NULL DEFAULT 30,
    "max_guests_per_slot" INTEGER NOT NULL DEFAULT 20,
    "min_advance_hours" INTEGER NOT NULL DEFAULT 1,
    "max_advance_days" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_slot_configs_pkey" PRIMARY KEY ("slot_config_id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "reservation_id" BIGSERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "location_id" BIGINT NOT NULL,
    "guest_name" VARCHAR(255) NOT NULL,
    "guest_email" VARCHAR(255) NOT NULL,
    "guest_phone" VARCHAR(20) NOT NULL,
    "party_size" INTEGER NOT NULL,
    "reservation_date" DATE NOT NULL,
    "reservation_time" VARCHAR(5) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "special_request" TEXT,
    "internal_note" TEXT,
    "created_by_admin_id" BIGINT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("reservation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_is_active_idx" ON "admin_users"("is_active");

-- CreateIndex
CREATE INDEX "catering_items_catering_request_id_idx" ON "catering_items"("catering_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "catering_packages_name_key" ON "catering_packages"("name");

-- CreateIndex
CREATE INDEX "catering_packages_is_active_sort_order_idx" ON "catering_packages"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "catering_requests_token_key" ON "catering_requests"("token");

-- CreateIndex
CREATE INDEX "catering_requests_status_idx" ON "catering_requests"("status");

-- CreateIndex
CREATE INDEX "catering_requests_status_quotation_deadline_idx" ON "catering_requests"("status", "quotation_deadline");

-- CreateIndex
CREATE INDEX "catering_requests_event_date_idx" ON "catering_requests"("event_date");

-- CreateIndex
CREATE INDEX "catering_requests_location_id_event_date_idx" ON "catering_requests"("location_id", "event_date");

-- CreateIndex
CREATE INDEX "catering_requests_contact_email_idx" ON "catering_requests"("contact_email");

-- CreateIndex
CREATE INDEX "catering_requests_token_idx" ON "catering_requests"("token");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts"("published_at");

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_category_id_idx" ON "blog_posts"("category_id");

-- CreateIndex
CREATE INDEX "blog_posts_is_featured_idx" ON "blog_posts"("is_featured");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "cms_pages_is_published_idx" ON "cms_pages"("is_published");

-- CreateIndex
CREATE INDEX "events_is_active_event_date_idx" ON "events"("is_active", "event_date");

-- CreateIndex
CREATE INDEX "events_is_featured_idx" ON "events"("is_featured");

-- CreateIndex
CREATE UNIQUE INDEX "media_files_r2_key_key" ON "media_files"("r2_key");

-- CreateIndex
CREATE INDEX "media_files_uploaded_by_idx" ON "media_files"("uploaded_by");

-- CreateIndex
CREATE INDEX "media_files_mime_type_idx" ON "media_files"("mime_type");

-- CreateIndex
CREATE INDEX "media_files_folder_idx" ON "media_files"("folder");

-- CreateIndex
CREATE INDEX "media_files_deleted_at_idx" ON "media_files"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "post_categories_slug_key" ON "post_categories"("slug");

-- CreateIndex
CREATE INDEX "post_categories_is_active_idx" ON "post_categories"("is_active");

-- CreateIndex
CREATE INDEX "post_categories_sort_order_idx" ON "post_categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_is_active_idx" ON "customers"("is_active");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_slug_key" ON "locations"("slug");

-- CreateIndex
CREATE INDEX "locations_is_active_idx" ON "locations"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "location_hours_location_id_day_of_week_key" ON "location_hours"("location_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_slug_key" ON "menu_categories"("slug");

-- CreateIndex
CREATE INDEX "menu_categories_is_active_sort_order_idx" ON "menu_categories"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_slug_key" ON "menu_items"("slug");

-- CreateIndex
CREATE INDEX "menu_items_category_id_idx" ON "menu_items"("category_id");

-- CreateIndex
CREATE INDEX "menu_items_is_active_deleted_at_idx" ON "menu_items"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "menu_items_is_featured_idx" ON "menu_items"("is_featured");

-- CreateIndex
CREATE INDEX "menu_item_prices_location_id_idx" ON "menu_item_prices"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_prices_menu_item_id_location_id_size_label_key" ON "menu_item_prices"("menu_item_id", "location_id", "size_label");

-- CreateIndex
CREATE INDEX "notification_logs_type_status_idx" ON "notification_logs"("type", "status");

-- CreateIndex
CREATE INDEX "notification_logs_recipient_idx" ON "notification_logs"("recipient");

-- CreateIndex
CREATE INDEX "notification_logs_template_idx" ON "notification_logs"("template");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_slot_configs_location_id_key" ON "reservation_slot_configs"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_token_key" ON "reservations"("token");

-- CreateIndex
CREATE INDEX "reservations_location_id_reservation_date_idx" ON "reservations"("location_id", "reservation_date");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_guest_email_idx" ON "reservations"("guest_email");

-- CreateIndex
CREATE INDEX "reservations_token_idx" ON "reservations"("token");

-- AddForeignKey
ALTER TABLE "catering_items" ADD CONSTRAINT "catering_items_catering_request_id_fkey" FOREIGN KEY ("catering_request_id") REFERENCES "catering_requests"("request_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catering_items" ADD CONSTRAINT "catering_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("menu_item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catering_requests" ADD CONSTRAINT "catering_requests_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catering_requests" ADD CONSTRAINT "catering_requests_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "catering_packages"("package_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catering_requests" ADD CONSTRAINT "catering_requests_handled_by_admin_id_fkey" FOREIGN KEY ("handled_by_admin_id") REFERENCES "admin_users"("admin_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "post_categories"("post_category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "admin_users"("admin_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_hours" ADD CONSTRAINT "location_hours_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("menu_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_prices" ADD CONSTRAINT "menu_item_prices_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("menu_item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_prices" ADD CONSTRAINT "menu_item_prices_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_slot_configs" ADD CONSTRAINT "reservation_slot_configs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("admin_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

