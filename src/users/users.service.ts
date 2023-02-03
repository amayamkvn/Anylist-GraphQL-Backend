import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  private readonly logger = new Logger('UsersService');
  
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

  ){}

  async create( signupInput: SignupInput ): Promise<User> {
    try{
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync( signupInput.password, 10 )
      });
      await this.usersRepository.save( newUser );
      return newUser;

    }catch(error){
      this.handleDBExceptions( error );
    }
  }

  async findOneByEmail( email: string): Promise<User> {
    try{
      const user = await this.usersRepository.findOneByOrFail({ email });
      return user;

    }catch(error){
      this.handleDBExceptions({
        code: 'error-001',
        detail: `Usuario con el email '${email}' no fue encontrado`
      });
    }
  }
  
  async findOneById( id: string): Promise<User> {
    try{
      const user = await this.usersRepository.findOneByOrFail({ id });
      return user;

    }catch(error){
      this.handleDBExceptions({
        code: 'error-003',
        detail: `ID '${id}' no fue encontrado`
      });
    }
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  block(id: string): Promise<User> {
    throw new Error(`Block method not implemented`);
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //------------------------- Manejo de errores --------------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  public handleDBExceptions( error: any): never { 
    //console.log(error);
    if( error.code === '23505' ){ 
      throw new BadRequestException( error.detail.replace('Key', '') );
    }
    if( error.code === '23503' ){
      throw new NotFoundException( error.detail );
    }
    if( error.code === 'error-001' ){
      throw new BadRequestException( error.detail );
    }
    if( error.code === 'error-002' ){
      throw new BadRequestException( error.detail );
    }
    if( error.code === 'error-003' ){
      throw new BadRequestException( error.detail );
    }
    if( error.code === 'error-004' ){
      throw new BadRequestException( error.detail );
    }
    this.logger.error(error); 
    throw new InternalServerErrorException('Unexpected error, check server logs in console');
  }
  
}
