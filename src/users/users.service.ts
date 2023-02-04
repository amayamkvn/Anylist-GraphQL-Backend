import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidRolesEnum } from '../auth/enums/valid-roles.enum';

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

  async findAll( param_roles: ValidRolesEnum[] ): Promise<User[]> {
    if( param_roles.length === 0 ){
      return await this.usersRepository.find({
        // TODO: No es necesario esto por la configuracion lazy realizada en el entity
        // relations: {
        //   last_update_by: true
        // }
      });
    }

    const users_roles = this.usersRepository.createQueryBuilder('users')
    .andWhere('ARRAY[roles] && ARRAY[:...roles]')
    .setParameter('roles', param_roles)  
    .getMany();

    return users_roles;
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

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
