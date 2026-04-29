import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';
import { GetCategoriesUseCase, GetMenuItemsUseCase, GetMenuItemByIdUseCase } from '@application/menu/use-cases/menu.use-cases';
import { MenuCategoryResponseDto, MenuItemResponseDto } from '../dtos/response/menu-response.dto';

@ApiTags('Menu - Public')
@Controller('p/menu')
export class PublicMenuController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getMenuItemsUseCase: GetMenuItemsUseCase,
    private readonly getMenuItemByIdUseCase: GetMenuItemByIdUseCase,
  ) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all active menu categories with items' })
  async getCategories() {
    const result = await this.getCategoriesUseCase.execute(undefined, true);
    return {
      data: MenuCategoryResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Public()
  @Get('items')
  @ApiOperation({ summary: 'Get all active menu items' })
  async getItems(
    @Query('categoryId', ParseBigIntPipe) categoryId?: bigint,
    @Query('locationId', ParseBigIntPipe) locationId?: bigint,
  ) {
    const result = await this.getMenuItemsUseCase.execute(
      undefined,
      {
        categoryId,
        locationId: locationId ?? BigInt(1),
        isActive: true,
      },
    );
    return {
      data: MenuItemResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Public()
  @Get('items/:id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  async getItemById(@Param('id', ParseBigIntPipe) id: bigint) {
    const item = await this.getMenuItemByIdUseCase.execute(id);
    if (!item.isActive || item.deletedAt) {
      throw new NotFoundException(`Menu item with id ${id} not found`);
    }
    return MenuItemResponseDto.from(item);
  }
}
