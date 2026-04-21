import { Module } from '@nestjs/common';
import { PublicMenuController, InternalMenuController } from './controllers';
import {
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  ToggleCategoryUseCase,
  DeleteCategoryUseCase,
  GetMenuItemsUseCase,
  GetMenuItemByIdUseCase,
  CreateMenuItemUseCase,
  UpdateMenuItemUseCase,
  ToggleMenuItemUseCase,
  DeleteMenuItemUseCase,
  UpdateMenuItemPricesUseCase,
} from '@application/menu/use-cases/menu.use-cases';
import {
  MenuCategoryAdapter,
  MenuItemAdapter,
  MenuItemPriceAdapter,
} from '@infrastructure/prisma/repositories/menu/menu.adapter';
import { LocationAdapter } from '@infrastructure/prisma/repositories/location/location.adapter';
import {
  MENU_CATEGORY_REPOSITORY_TOKEN,
  MENU_ITEM_REPOSITORY_TOKEN,
  MENU_ITEM_PRICE_REPOSITORY_TOKEN,
} from '@domain/menu/ports/menu.repository.token';
import { LOCATION_REPOSITORY_TOKEN } from '@domain/location/ports/location.repository.token';

@Module({
  controllers: [PublicMenuController, InternalMenuController],
  providers: [
    // Adapters
    MenuCategoryAdapter,
    MenuItemAdapter,
    MenuItemPriceAdapter,
    LocationAdapter,
    // Tokens
    { provide: MENU_CATEGORY_REPOSITORY_TOKEN, useClass: MenuCategoryAdapter },
    { provide: MENU_ITEM_REPOSITORY_TOKEN, useClass: MenuItemAdapter },
    { provide: MENU_ITEM_PRICE_REPOSITORY_TOKEN, useClass: MenuItemPriceAdapter },
    { provide: LOCATION_REPOSITORY_TOKEN, useClass: LocationAdapter },
    // Use Cases - Category
    GetCategoriesUseCase,
    GetCategoryByIdUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    ToggleCategoryUseCase,
    DeleteCategoryUseCase,
    // Use Cases - Item
    GetMenuItemsUseCase,
    GetMenuItemByIdUseCase,
    CreateMenuItemUseCase,
    UpdateMenuItemUseCase,
    ToggleMenuItemUseCase,
    DeleteMenuItemUseCase,
    // Use Cases - Price
    UpdateMenuItemPricesUseCase,
  ],
  exports: [
    MENU_CATEGORY_REPOSITORY_TOKEN,
    MENU_ITEM_REPOSITORY_TOKEN,
    MENU_ITEM_PRICE_REPOSITORY_TOKEN,
  ],
})
export class MenuModule {}
