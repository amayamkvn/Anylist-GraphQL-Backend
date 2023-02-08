import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateListInput {

  @Field(() => String, { description: 'Nombre de la lista' })
  @IsString()
  @IsNotEmpty()
  listname: string;

}
