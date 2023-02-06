import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidRolesEnum } from '../auth/enums/valid-roles.enum';
import { PaginationArg, SearchArg } from 'src/common/dto/args';
import { makePagination } from '../../../../Plan operativo anual/Backend-SM/src/poa/pei/helper/make-pagination.helper';

@Injectable()
export class UsersService {

  private readonly logger = new Logger('UsersService');
  
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

  ){}

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //--------------------- Creacion de un nuevo user ----------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
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

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //------------------- Busqueda de un user por email --------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
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
  
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //-------------------- Busqueda de un user por ID ----------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
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

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //-------------------- Busqueda de todos los users ---------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async findAll( param_roles: ValidRolesEnum[], pagination: PaginationArg, {search}: SearchArg ): Promise<User[]> {
    const {limit, offset} = pagination;

    if( param_roles.length === 0 ){
      const queryBuilder = this.usersRepository.createQueryBuilder()
        .take(limit)
        .skip(offset)
      
      if( search ){
        queryBuilder.where('LOWER(fullname) ILIKE :name', { name: `%${ search }%` })
      }
      
      return queryBuilder.getMany();
    }

    const users_roles = this.usersRepository.createQueryBuilder('users')
    .take(limit)
    .skip(offset)
    .where('ARRAY[roles] && ARRAY[:...roles]')
    .setParameter('roles', param_roles)  
    
    if( search ){
      users_roles.andWhere('LOWER(fullname) ILIKE :name', { name: `%${ search }%` })
    }

    return users_roles.getMany();
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //---------------------- Actualizacion de un user ----------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async update( id: string, updatedBy: User, updateUserInput: UpdateUserInput ): Promise<User> {
    try{
      const user_updated = await this.usersRepository.preload({
        ...updateUserInput, id
      });
      if( !user_updated ) throw new NotFoundException(`El item con el id ${id} no ha sido encontrado`);
      user_updated.last_update_by = updatedBy;
      return await this.usersRepository.save( user_updated );

    }catch(error){
      this.handleDBExceptions( error );
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //------------------------ Bloqueo de un usuario -----------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async block( id: string, admin: User ): Promise<User> {
    const userToBlock = await this.findOneById( id );
    userToBlock.is_active = false;
    userToBlock.last_update_by = admin;

    const usuario_bloqueado = await this.usersRepository.save( userToBlock );
    return usuario_bloqueado;
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
