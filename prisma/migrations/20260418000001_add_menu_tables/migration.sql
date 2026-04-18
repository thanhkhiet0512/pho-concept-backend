-- CreateTable
CREATE TABLE "menu_categories" (
    "menu_category_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_vi" VARCHAR(255),
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "description_vi" TEXT,
    "image_url" VARCHAR(500),
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
    "name" VARCHAR(255) NOT NULL,
    "name_vi" VARCHAR(255),
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "description_vi" TEXT,
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
CREATE INDEX "menu_item_prices_menu_item_id_idx" ON "menu_item_prices"("menu_item_id");

-- CreateIndex
CREATE INDEX "menu_item_prices_location_id_idx" ON "menu_item_prices"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_prices_menu_item_id_location_id_size_label_key" ON "menu_item_prices"("menu_item_id", "location_id", "size_label");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("menu_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_prices" ADD CONSTRAINT "menu_item_prices_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("menu_item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_prices" ADD CONSTRAINT "menu_item_prices_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE CASCADE ON UPDATE CASCADE;
