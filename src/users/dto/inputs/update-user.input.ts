import { CreateUserInput } from './create-user.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ValidRolesEnum } from '../../../auth/enums/valid-roles.enum';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field( () => [ValidRolesEnum], { nullable: true }  )
  @IsOptional()  
  @IsArray()
  roles?: ValidRolesEnum[];

  @Field( () => Boolean, { nullable: true } )
  @IsOptional()
  is_active?: boolean;

}
