import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListInput, UpdateListInput } from './dto';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginationArg, SearchArg } from 'src/common/dto/args';

@Injectable()
export class ListsService {

  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly usersService: UsersService,
  ){}

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //-------------------- Creacion de una nueva lista ---------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async create( user: User, createListInput: CreateListInput ): Promise<List> {
    try{
      const newList = this.listRepository.create({ ...createListInput, user });
      await this.listRepository.save( newList );

      return newList;
    }catch(error){
      this.usersService.handleDBExceptions(error);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //-------------------- Busqueda de todas las listas --------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async findAll( user: User, pagination: PaginationArg, {search}: SearchArg ) {
    const {limit, offset} = pagination;

    const queryBuilder = this.listRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });
    
    if( search ){
      queryBuilder.andWhere('LOWER(listname) like :name', { name: `%${ search.toLowerCase() }%` })
    }

    return queryBuilder.getMany();
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //----------------------- Busqueda de una lista ------------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async findOne( id: string, user: User ): Promise<List> {
    try{
      const list = await this.listRepository.findOne({ 
        where: {
          id: id, 
          user: {id: user.id}
        }
      });
      if( !list ) throw new NotFoundException(`La lista con el id ${id} no ha sido encontrado`);

      return list;
      
    }catch(error){
      this.usersService.handleDBExceptions(error);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //--------------------- Actualizacion de una lista ---------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async update( user:User, id: string, updateListInput: UpdateListInput ): Promise<List> {
    try{
      await this.findOne(id, user);
      const list = await this.listRepository.preload( updateListInput )
      if( !list ) throw new NotFoundException(`La lista con el id ${id} no ha sido encontrada`);

      await this.listRepository.save( list );

      return list;

    }catch(error){
      this.usersService.handleDBExceptions(error);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //--------------------- Eliminacion de una lista -----------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async remove(id: string, user: User): Promise<List> {
    const list = await this.findOne( id, user );
    await this.listRepository.remove( list );

    return { ...list, id };
  }


  async listCount( user: User ): Promise<number> {
    return this.listRepository.count({
      where: {user: {id: user.id}}
    })
  }

}
