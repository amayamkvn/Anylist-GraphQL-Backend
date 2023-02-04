
//TODO: Implementar enum como GraphQL Enum Type

import { registerEnumType } from "@nestjs/graphql";

export enum ValidRolesEnum {
    admin = 'admin',
    user = 'user',
    super_user = 'super_user'
}

registerEnumType( ValidRolesEnum, { name: 'ValidRolesEnum' } )