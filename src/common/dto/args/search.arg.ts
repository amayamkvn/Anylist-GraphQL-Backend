import { Field, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsString } from "class-validator";

@ArgsType()
export class SearchArg {

    @Field( () => String, { nullable: true } )
    @IsString()
    @IsOptional()
    search?: string;

}