import { IsArray } from "class-validator";
import { ValidRolesEnum } from "../../../auth/enums/valid-roles.enum";
import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ValidRolesArg {

    @Field( () => [ValidRolesEnum], { nullable: true } )
    @IsArray()
    roles: ValidRolesEnum[] = [];
}