import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/inputs/login.input';
import { SignupInput } from './dto/inputs/signup.input';
import { AuthResponse } from './types/auth-response.type';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ValidRolesEnum } from './enums/valid-roles.enum';

@Resolver(() => AuthResponse)
export class AuthResolver {

  constructor(
    private readonly authService: AuthService
  ) {}

  @Mutation(() => AuthResponse, { name: 'signup' })
  async signup(
    @Args('signupInput') signupInput: SignupInput
  ): Promise<AuthResponse> {

    return this.authService.signup( signupInput );
  }
  
  @Mutation(() => AuthResponse, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput
  ): Promise<AuthResponse> {
    
    return this.authService.login( loginInput );
  }

  @Query(() => AuthResponse, { name: 'revalite' })
  @UseGuards(JwtAuthGuard)
  async revaliteToken(
    @CurrentUser(/* [ ValidRoles.admin ] */) user: User
  ): Promise<AuthResponse> {
    return this.authService.revalidateToken( user );
  }

  // @Query(() => Auth, { name: 'auth' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.findOne(id);
  // }

  // @Mutation(() => Auth)
  // updateAuth(@Args('updateAuthInput') updateAuthInput: UpdateAuthInput) {
  //   return this.authService.update(updateAuthInput.id, updateAuthInput);
  // }

  // @Mutation(() => Auth)
  // removeAuth(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.remove(id);
  // }
}
