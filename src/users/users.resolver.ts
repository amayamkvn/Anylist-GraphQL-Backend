import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ValidRolesArg } from './dto/args/roles.arg';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRolesEnum } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto';
import { ItemsService } from 'src/items/items.service';
import { Item } from 'src/items/entities/item.entity';
import { PaginationArg, SearchArg } from 'src/common/dto/args';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from '../lists/lists.service';


@Resolver(() => User)
@UseGuards( JwtAuthGuard )
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listService: ListsService
    ) {}

  // @Mutation(() => User)
  // createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
  //   return this.usersService.create(createUserInput);
  // }

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: ValidRolesArg,
    @Args() pagination: PaginationArg,
    @Args() search: SearchArg,
    @CurrentUser([ ValidRolesEnum.admin ]) user: User
  ): Promise<User[]> {
    //console.log({validRoles});
    return this.usersService.findAll( validRoles.roles, pagination, search );
  }

  @Query(() => User, { name: 'user' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ): Promise<User> {
    return this.usersService.findOneById( id );
  }

  @Mutation(() => User, { name: 'UpdateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ ValidRolesEnum.admin ]) user: User
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, user, updateUserInput);
  }

  @Mutation(() => User, { name: 'blockUser' })
  async blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ ValidRolesEnum.admin ]) user: User
  ): Promise<User> {
    return this.usersService.block(id, user);
  }

  @ResolveField( () => Int, { name: 'itemCount' } )
  async itemCount(
    @CurrentUser([ ValidRolesEnum.admin ]) admin: User,
    @Parent() user: User
  ): Promise<number>{
    return this.itemsService.itemCount( user );
  }
  
  @ResolveField( () => [Item], { name: 'items' } )
  async itemsByUser(
    @CurrentUser([ ValidRolesEnum.admin ]) admin: User,
    @Parent() user: User,
    @Args() pagination: PaginationArg,
    @Args() search: SearchArg,
  ): Promise<Item[]>{
    return this.itemsService.findAll( user, pagination, search );
  }

  @ResolveField( () => [List], { name: 'listas' } )
  async listsByUser(
    @CurrentUser([ ValidRolesEnum.admin ]) admin: User,
    @Parent() user: User,
    @Args() pagination: PaginationArg,
    @Args() search: SearchArg,
  ): Promise<List[]>{
    return this.listService.findAll( user, pagination, search );
  }

  @ResolveField( () => Int, { name: 'listCount' } )
  async listCount(
    @CurrentUser([ ValidRolesEnum.admin ]) admin: User,
    @Parent() user: User
  ): Promise<number>{
    return this.listService.listCount( user );
  }

}
