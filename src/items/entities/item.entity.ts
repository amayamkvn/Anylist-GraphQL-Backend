import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { ListItem } from 'src/list-item/entities/list-item.entity';

@Entity({ name: 'items' })
@ObjectType()
export class Item {

  @PrimaryGeneratedColumn('uuid', { comment: 'Campo que hace referencia al ID del producto' })
  @Field(() => ID, { description: 'Campo que hace referencia al ID del producto' })
  id: string;
  
  @Column({ unique: false, comment: 'Campo que hace referencia al nombre del producto' })  
  @Field(() => String, { description: 'Campo que hace referencia al nombre del producto' })
  name: string;
  
  // @Column({ comment: 'Campo que hace referencia a la cantidad de unidades' })
  // @Field(() => Float, { description: 'Campo que hace referencia a la cantidad de unidades' })
  // quantity: number;
  
  @Column({ nullable: true, comment: 'Campo que hace referencia a la unidad de medida' })  
  @Field(() => String, { description: 'Campo que hace referencia a la unidad de medida', nullable: true })
  quantityUnits?: string;

  //TODO: Relaciones

  @ManyToOne( () => User, (user) => user.items, { nullable: false, lazy: true })
  @Index('user-index')
  @Field( () => User )
  user: User;
  
  @OneToMany( () => ListItem, (listItem) => listItem.item, { lazy: true } )
  @Field( () => [ListItem] )
  listItem: ListItem[];

}
