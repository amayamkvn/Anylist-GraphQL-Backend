import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { UsersModule } from '../users/users.module';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ListItemModule } from '../list-item/list-item.module';

@Module({
  providers: [
    ListsResolver, 
    ListsService,
    UsersService
  ],
  imports: [
    TypeOrmModule.forFeature([ List, User ]),
    ListItemModule
  ], 
  exports: [
    ListsService,
    TypeOrmModule
  ]
})
export class ListsModule {}
