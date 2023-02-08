import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput, UpdateListInput } from './dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { PaginationArg, SearchArg } from 'src/common/dto/args';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListItemService } from '../list-item/list-item.service';
import { ValidRolesEnum } from 'src/auth/enums/valid-roles.enum';

@Resolver(() => List)
@UseGuards( JwtAuthGuard )
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    private readonly listItemService: ListItemService
  ) {}

  //------------------------- Create list -------------------------//
  @Mutation(() => List)
  async createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.create(user, createListInput);
  }

  //------------------------ Find All list ------------------------//
  @Query(() => [List], { name: 'lists' })
  async findAll(
    @Args() paginationArgs: PaginationArg,
    @Args() searchArgs: SearchArg,
    @CurrentUser() user: User
  ): Promise<List[]> {
    return this.listsService.findAll( user, paginationArgs, searchArgs );
  }

  //------------------------ Find One list ------------------------//
  @Query(() => List, { name: 'oneList' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.findOne(id, user);
  }

  //------------------------- Update list -------------------------//
  @Mutation(() => List)
  async updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.update(user, updateListInput.id, updateListInput);
  }

  //------------------------- Remove list -------------------------//
  @Mutation(() => List)
  async removeList(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.remove(id, user);
  }


  @ResolveField(()=> [ListItem], { name: 'items' })
  async getListItems(
    @Parent() list: List,
    @Args() pagination: PaginationArg,
    @Args() search: SearchArg,
  ): Promise<ListItem[]>{

    return this.listItemService.findAll( list, pagination, search );
  }

  @ResolveField( () => Int, { name: 'totalItems' } )
  async countListItemByList(
    @CurrentUser([ ValidRolesEnum.admin ]) admin: User,
    @Parent() list: List
  ): Promise<number>{
    return this.listItemService.count( list );
  }




}
