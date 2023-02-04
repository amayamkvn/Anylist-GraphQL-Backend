import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
@ObjectType()
export class User {

  @PrimaryGeneratedColumn('uuid', { comment: 'Campo que hace referencia al ID del usuario' })
  @Field(() => ID, { description: 'Campo que hace referencia al ID del usuario' })
  id: string;

  @Column({ comment: 'Campo que hace referencia al nombre completo del usuario', unique: true })
  @Field( () => String, { description: 'Campo que hace referencia al nombre completo del usuario' } )
  fullname: string;

  @Column({ comment: 'Campo que hace referencia al correo del usuario', unique: true })
  @Field( () => String, { description: 'Campo que hace referencia al correo del usuario' } )
  email: string;

  @Column({ comment: 'Campo que hace referencia a la contrasena del usuario' })
  //@Field( () => String, { description: '' } )
  password: string;

  @Column({ type: 'text', array: true, default: ['user'], comment: 'Campo que hace referencia al rol del usuario' })
  @Field( () => [String], { description: 'Campo que hace referencia al rol del usuario' } )
  roles: string[];

  @Column({ type: 'boolean', default: true, comment: 'Campo que hace referencia al estado del usuario' })
  @Field( () => Boolean, { description: 'Campo que hace referencia al estado del usuario' } )
  is_active: boolean;

  //TODO: Relaciones
  
  @ManyToOne( () => User, (user) => user.last_update_by, { nullable: true, lazy: true })
  @JoinColumn({ name: 'last_update_by' })
  @Field( () => User, { nullable: true } )
  last_update_by?: User;

}
