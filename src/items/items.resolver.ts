import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemInput, UpdateItemInput } from './dto';
import { ParseUUIDPipe } from '@nestjs/common';


@Resolver(() => Item)
export class ItemsResolver {

  constructor(
    private readonly itemsService: ItemsService

  ) {}

  //------------------------- Create item -------------------------//
  @Mutation(() => Item)
  async createItem(
    @Args('createItemInput') createItemInput: CreateItemInput
  ): Promise<Item> {
    return this.itemsService.create(createItemInput);
  }

  //------------------------ Find All item ------------------------//
  @Query(() => [Item], { name: 'items' })
  async findAll(): Promise<Item[]> {
    return this.itemsService.findAll();
  }

  //------------------------ Find One item ------------------------//
  @Query(() => Item, { name: 'item' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ): Promise<Item> {
    return this.itemsService.findOne(id);
  }

  //------------------------- Update item -------------------------//
  @Mutation(() => Item)
  async updateItem(
    @Args('updateItemInput') updateItemInput: UpdateItemInput
  ): Promise<Item> {
    return this.itemsService.update( updateItemInput.id, updateItemInput );
  }

  //------------------------- Remove item -------------------------//
  @Mutation(() => Item)
  async removeItem(@Args('id', { type: () => ID }) id: string) {
    return this.itemsService.remove(id);
  }
}
