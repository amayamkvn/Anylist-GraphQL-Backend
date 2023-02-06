import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemInput, UpdateItemInput } from './dto';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { PaginationArg, SearchArg } from '../common/dto/args';


@Resolver(() => Item)
@UseGuards( JwtAuthGuard )
export class ItemsResolver {

  constructor(
    private readonly itemsService: ItemsService

  ) {}

  //------------------------- Create item -------------------------//
  @Mutation(() => Item)
  async createItem(
    @Args('createItemInput') createItemInput: CreateItemInput,
    @CurrentUser() user: User
  ): Promise<Item> {
    return this.itemsService.create(user, createItemInput);
  }

  //------------------------ Find All item ------------------------//
  @Query(() => [Item], { name: 'items' })
  async findAll(
    @Args() paginationArgs: PaginationArg,
    @Args() searchArgs: SearchArg,
    @CurrentUser() user: User
  ): Promise<Item[]> {
    return this.itemsService.findAll( user, paginationArgs, searchArgs );
  }

  //------------------------ Find One item ------------------------//
  @Query(() => Item, { name: 'item' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<Item> {
    return this.itemsService.findOne(id, user);
  }

  //------------------------- Update item -------------------------//
  @Mutation(() => Item)
  async updateItem(
    @Args('updateItemInput') updateItemInput: UpdateItemInput,
    @CurrentUser() user: User
  ): Promise<Item> {
    return this.itemsService.update( user, updateItemInput.id, updateItemInput );
  }

  //------------------------- Remove item -------------------------//
  @Mutation(() => Item)
  async removeItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User
  ) {
    return this.itemsService.remove(id, user);
  }
}
