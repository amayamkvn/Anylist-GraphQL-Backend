import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Column, PrimaryGeneratedColumn, ManyToOne, Entity, Index, OneToMany } from 'typeorm';
import { ListItem } from '../../list-item/entities/list-item.entity';

@Entity({ name: 'lists' })
@ObjectType()
export class List {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID de la lista' })
  id: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Nombre de la lista' })
  listname: string;

  //TODO: Relacion, index('userId-list-index')
  @ManyToOne( () => User, (user) => user.lists, { nullable: false, lazy: true } )
  @Index('userId-list-index')
  @Field(() => User, { description: 'Usuario al que pertenece la lista' })
  user: User;

  @OneToMany( () => ListItem, (listItem) => listItem.list, { lazy: true } )
  //@Field( () => [ListItem] )
  listItem: ListItem[];

}
