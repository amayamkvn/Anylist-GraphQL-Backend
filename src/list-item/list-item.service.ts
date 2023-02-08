import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { PaginationArg } from '../common/dto/args/pagination.arg';
import { SearchArg } from '../common/dto/args/search.arg';
import { List } from 'src/lists/entities/list.entity';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepo: Repository<ListItem>,

  ){}


  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    try{
      const { itemId, listId, ...rest } = createListItemInput;
      const newListItem = await this.listItemRepo.create({
        ...rest,
        item: {id: itemId},
        list: {id: listId},
      });

      await this.listItemRepo.save( newListItem );

      return this.findOne( newListItem.id );
    }catch(error){
      throw new Error(`error, usar el handler`);
    }
  }

  async findAll( list: List, pagination: PaginationArg, {search}: SearchArg ): Promise<ListItem[]> {
    
    const { limit, offset } = pagination;
    const queryBuilder = this.listItemRepo.createQueryBuilder('listItem')
      .innerJoin('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });
    
    if( search ){
      queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${ search.toLowerCase() }%` })
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const oneListItem = await this.listItemRepo.findOneBy({ id });
    if( !oneListItem ){
      throw new NotFoundException(`ListeItem con el id ${id} no fue encontrado`);
    }

    return oneListItem;
  }

  async update(id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {

    const { listId, itemId, ...rest } = updateListItemInput;
    const queryBuilder = this.listItemRepo.createQueryBuilder()
    .update()
    .set( rest )
    .where('id = :id', {id})

    if( listId ) queryBuilder.set({ list: { id: listId } })
    if( itemId ) queryBuilder.set({ list: { id: itemId } })

    await queryBuilder.execute();
    return this.findOne( id );
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  async count( list: List ): Promise<number> {
    return this.listItemRepo.count({
      where: {list: {id: list.id}}
    })
  }
}
