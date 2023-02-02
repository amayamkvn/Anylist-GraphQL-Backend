import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


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
  async create(createItemInput: CreateItemInput): Promise<Item> {
    try{
      const newItem = this.itemsRepository.create( createItemInput );
      await this.itemsRepository.save( newItem );

      return newItem;
    }catch(error){
      error;
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //----------------- Busqueda de todos los items items ------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //------------------------ Busqueda de un item -------------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async findOne( id: string ): Promise<Item> {
    try{
      const item = await this.itemsRepository.findOne({ where: {id: id}});
      if( !item ) throw new NotFoundException(`El item con el id ${id} no ha sido encontrado`);
      return item;
      
    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //---------------------- Actualizacion de un item ----------------------//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    try{
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
  async remove( id: string ): Promise<Item> {
    const item = await this.findOne( id );
    await this.itemsRepository.remove( item );

    return { ...item, id };
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
