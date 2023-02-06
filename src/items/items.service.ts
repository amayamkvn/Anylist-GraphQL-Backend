import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto';
import { Item } from './entities/item.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginationArg, SearchArg } from 'src/common/dto/args';



@Injectable()
export class ItemsService {

  private readonly logger = new Logger('ItemsService');
  
  constructor(
    @InjectRepository( Item )
    private readonly itemsRepository: Repository<Item>
  ){}

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //--------------------- Creacion de un nuevo item ----------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async create(user: User, createItemInput: CreateItemInput): Promise<Item> {
    try{
      const newItem = this.itemsRepository.create({ ...createItemInput, user });
      await this.itemsRepository.save( newItem );

      return newItem;
    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //-------------------- Busqueda de todos los items ---------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async findAll( user: User, pagination: PaginationArg, {search}: SearchArg ): Promise<Item[]> {
    //console.log(user);
    const {limit, offset} = pagination;

    const queryBuilder = this.itemsRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });
    
    if( search ){
      queryBuilder.andWhere('LOWER(name) like :name', { name: `%${ search.toLowerCase() }%` })
    }
    // const items = await this.itemsRepository.find({
    //   take: limit, 
    //   skip: offset,
    //   where: {user: {id: user.id}, name: ILike(`%${search}%`)}
    // });
    return queryBuilder.getMany();
  }


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //------------------------ Busqueda de un item -------------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async findOne( id: string, user: User ): Promise<Item> {
    try{
      const item = await this.itemsRepository.findOne({ 
        where: {
          id: id, 
          user: {id: user.id}
        }
      });
      if( !item ) throw new NotFoundException(`El item con el id ${id} no ha sido encontrado`);
      //item.user = user;

      return item;
      
    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //---------------------- Actualizacion de un item ----------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async update( user: User, id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    try{
      await this.findOne(id, user);
      const item = await this.itemsRepository.preload( updateItemInput );
      if( !item ) throw new NotFoundException(`El item con el id ${id} no ha sido encontrado`);
      await this.itemsRepository.save( item );
      return item;

    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //---------------------- Eliminacion de un item ------------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async remove( id: string, user: User ): Promise<Item> {
    const item = await this.findOne( id, user );
    await this.itemsRepository.remove( item );

    return { ...item, id };
  }

  async itemCount( user: User ): Promise<number> {
    return this.itemsRepository.count({
      where: {user: {id: user.id}}
    })
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //------------------------- Manejo de errores --------------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  private handleDBExceptions( error: any){ 
    console.log(error);
    if( error.code === '23505'){ 
      throw new BadRequestException(error.detail)
    }
    if( error.code === '23503'){
      throw new NotFoundException(error.detail)
    }
    this.logger.error(error); 
    throw new InternalServerErrorException('Unexpected error, check server logs in console');
  }

}
