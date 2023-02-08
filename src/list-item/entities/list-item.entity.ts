import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { Item } from 'src/items/entities/item.entity';
import { List } from '../../lists/entities/list.entity';

@Entity({ name: 'list-items' })
@Unique('listItem-item', ['list','item']) //Constrain que nos ayuda a no tener registros duplicados
@ObjectType()
export class ListItem {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, {})
  id: string;
  
  @Column({ type: 'numeric' })
  @Field(() => Number, {})
  quantity: number;
  
  @Column({ type: 'boolean' })
  @Field(() => Boolean, {})
  completed: boolean;

  //TODO: Relaciones
  @ManyToOne( () => List, (list) => list.listItem, { lazy: true } )
  @Field(() => List)
  list: List;
  
  @ManyToOne( () => Item, (item) => item.listItem, { lazy: true } )
  @Field(() => Item)
  item: Item;

}
