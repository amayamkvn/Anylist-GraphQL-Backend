import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupInput } from './dto/inputs/signup.input';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/inputs/login.input';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService
  ){}

  private getJwtToken( usertId: string ){
    const token = this._jwtService.sign({ id: usertId });
    return token;
  }

  async signup( signupInput: SignupInput ): Promise<AuthResponse> {

    //TODO: Crear usuario
    const user = await this._usersService.create( signupInput );

    //TODO: Crear JWT
    const token = this.getJwtToken( user.id );
    
    return { token, user };
  }
  
  async login( loginInput: LoginInput ): Promise<AuthResponse> {

    const { email, password } = loginInput;
    //TOD0: Crear usuario
    const user = await this._usersService.findOneByEmail( email );
    if ( !bcrypt.compareSync( password, user.password ) ){
      this._usersService.handleDBExceptions({
        code: 'error-002',
        detail: `Contraseña incorrecta`
      })
    }

    //TODO: Crear JWT
    const token = this.getJwtToken( user.id );
    
    return { token, user };
  }

  async validateUser( id: string ): Promise<User> {
    const user = await this._usersService.findOneById( id );
    if( !user.is_active ){
      this._usersService.handleDBExceptions({
        code: 'error-004',
        detail: `User is inactive, talk with an admin`
      }) 
    }

    delete user.password;

    return user;
  }

  async revalidateToken( user: User): Promise<AuthResponse> {
    const token = await this.getJwtToken( user.id );
    return {token, user};
  }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthInput: UpdateAuthInput) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
