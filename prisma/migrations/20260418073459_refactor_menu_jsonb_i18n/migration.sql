/*
  Warnings:

  - You are about to drop the column `description` on the `menu_categories` table. All the data in the column will be lost.
  - You are about to drop the column `description_vi` on the `menu_categories` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `menu_categories` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `menu_categories` table. All the data in the column will be lost.
  - You are about to drop the column `name_vi` on the `menu_categories` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `description_vi` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `name_vi` on the `menu_items` table. All the data in the column will be lost.
  - Added the required column `name_i18n` to the `menu_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_i18n` to the `menu_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "locations" ALTER COLUMN "timezone" SET DEFAULT 'America/Los_Angeles';

-- AlterTable
ALTER TABLE "menu_categories" DROP COLUMN "description",
DROP COLUMN "description_vi",
DROP COLUMN "image_url",
DROP COLUMN "name",
DROP COLUMN "name_vi",
ADD COLUMN     "name_i18n" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "menu_items" DROP COLUMN "description",
DROP COLUMN "description_vi",
DROP COLUMN "name",
DROP COLUMN "name_vi",
ADD COLUMN     "description_i18n" JSONB,
ADD COLUMN     "name_i18n" JSONB NOT NULL;
