import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRole } from '@common/enums/admin-role.enum';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';
import { PaginationDto } from '@common/dto/pagination.dto';
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
  CreateCategoryDto,
  UpdateCategoryDto,
  ToggleActiveDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  UpdateMenuItemPricesDto,
} from '@application/menu/dtos/menu.dto';
import { MenuCategoryResponseDto, MenuItemResponseDto, MenuItemPriceResponseDto } from '../dtos/response/menu-response.dto';

@ApiTags('Menu - Admin')
@ApiBearerAuth()
@Controller('i/menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternalMenuController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly toggleCategoryUseCase: ToggleCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly getMenuItemsUseCase: GetMenuItemsUseCase,
    private readonly getMenuItemByIdUseCase: GetMenuItemByIdUseCase,
    private readonly createMenuItemUseCase: CreateMenuItemUseCase,
    private readonly updateMenuItemUseCase: UpdateMenuItemUseCase,
    private readonly toggleMenuItemUseCase: ToggleMenuItemUseCase,
    private readonly deleteMenuItemUseCase: DeleteMenuItemUseCase,
    private readonly updateMenuItemPricesUseCase: UpdateMenuItemPricesUseCase,
  ) {}

  // ===================== CATEGORY ENDPOINTS =====================

  @Get('categories')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get all categories with pagination' })
  async getCategories(
    @Query() pagination: PaginationDto,
    @Query('active') active?: string,
  ) {
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
    const result = await this.getCategoriesUseCase.execute(pagination, isActive);
    return {
      data: MenuCategoryResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('categories/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get category by ID' })
  async getCategoryById(@Param('id', ParseBigIntPipe) id: bigint) {
    const category = await this.getCategoryByIdUseCase.execute(id);
    return MenuCategoryResponseDto.from(category);
  }

  @Post('categories')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new category' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.createCategoryUseCase.execute(dto);
    return MenuCategoryResponseDto.from(category);
  }

  @Put('categories/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update category' })
  async updateCategory(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.updateCategoryUseCase.execute(id, dto);
    return MenuCategoryResponseDto.from(category);
  }

  @Patch('categories/:id/toggle')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Toggle category active status' })
  async toggleCategory(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: ToggleActiveDto,
  ) {
    const category = await this.toggleCategoryUseCase.execute(id, dto.isActive);
    return MenuCategoryResponseDto.from(category);
  }

  @Delete('categories/:id')
  @Roles(AdminRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete category' })
  async deleteCategory(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.deleteCategoryUseCase.execute(id);
    return { message: 'Category deleted successfully' };
  }

  // ===================== MENU ITEM ENDPOINTS =====================

  @Get('items')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get all menu items with pagination' })
  async getItems(
    @Query() pagination: PaginationDto,
    @Query('categoryId', ParseBigIntPipe) categoryId?: bigint,
    @Query('locationId', ParseBigIntPipe) locationId?: bigint,
    @Query('active') active?: string,
  ) {
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
    const result = await this.getMenuItemsUseCase.execute(pagination, {
      categoryId,
      locationId,
      isActive,
    });
    return {
      data: MenuItemResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('items/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get menu item by ID' })
  async getItemById(@Param('id', ParseBigIntPipe) id: bigint) {
    const item = await this.getMenuItemByIdUseCase.execute(id);
    return MenuItemResponseDto.from(item);
  }

  @Post('items')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new menu item' })
  async createItem(@Body() dto: CreateMenuItemDto) {
    const item = await this.createMenuItemUseCase.execute(dto);
    return MenuItemResponseDto.from(item);
  }

  @Put('items/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update menu item' })
  async updateItem(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateMenuItemDto,
  ) {
    const item = await this.updateMenuItemUseCase.execute(id, dto);
    return MenuItemResponseDto.from(item);
  }

  @Patch('items/:id/toggle')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Toggle menu item active status' })
  async toggleItem(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: ToggleActiveDto,
  ) {
    const item = await this.toggleMenuItemUseCase.execute(id, dto.isActive);
    return MenuItemResponseDto.from(item);
  }

  @Delete('items/:id')
  @Roles(AdminRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete menu item' })
  async deleteItem(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.deleteMenuItemUseCase.execute(id);
    return { message: 'Menu item deleted successfully' };
  }

  // ===================== PRICE ENDPOINTS =====================

  @Patch('items/:id/prices')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update menu item prices by location' })
  async updatePrices(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateMenuItemPricesDto,
  ) {
    const prices = await this.updateMenuItemPricesUseCase.execute(id, dto);
    return MenuItemPriceResponseDto.fromList(prices);
  }
}
