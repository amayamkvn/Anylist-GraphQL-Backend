import { InputType, Field, Float } from '@nestjs/graphql';
import { IsPositive, IsString, IsOptional, IsNotEmpty } from 'class-validator';


@InputType()
export class CreateItemInput {
  
  @Field(() => String, { description: 'Campo que hace referencia al nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @Field(() => Float, { description: 'Campo que hace referencia a la cantidad de la compra' })
  @IsPositive()
  quantity: number;
  
  @Field(() => String, { description: 'Campo que hace referencia a la cantidad de unidades', nullable: true })
  @IsString()
  @IsOptional()
  quantityUnits?: string;

}
