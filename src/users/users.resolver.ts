import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ValidRolesArg } from './dto/args/roles.arg';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRolesEnum } from 'src/auth/enums/valid-roles.enum';

@Resolver(() => User)
@UseGuards( JwtAuthGuard )
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // @Mutation(() => User)
  // createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
  //   return this.usersService.create(createUserInput);
  // }

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: ValidRolesArg,
    @CurrentUser([ ValidRolesEnum.admin ]) user: User
  ): Promise<User[]> {
    console.log({validRoles});
    
    return this.usersService.findAll( validRoles.roles );
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ): Promise<User> {
    return this.usersService.findOneById( id );
  }

  // @Mutation(() => User)
  // updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
  //   return this.usersService.update(updateUserInput.id, updateUserInput);
  // }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ ValidRolesEnum.admin ]) user: User
  ): Promise<User> {
    return this.usersService.block(id, user);
  }


}
