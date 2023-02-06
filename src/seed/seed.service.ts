import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { Item } from 'src/items/entities/item.entity';
import { SEED_USERS, SEED_ITEMS } from './data/seed-data';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {

    private isProd: Boolean;

    constructor(
        @InjectRepository(User)
        private readonly usersReporitory: Repository<User>,
        @InjectRepository(Item)
        private readonly itemsReporitory: Repository<Item>,

        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,

    ){
        this.isProd = configService.get('STATE') === 'prod';
    }

    async executeSeed(): Promise<boolean>{
        if( this.isProd ){
            throw new UnauthorizedException(`We cannot run SEED on Prod`);
        }
        
        //TODO: Limpiar base de datos
        await this.deleteDatabase();

        //TODO: Cargar usuarios
        const userr = await this.loadUsers();

        //TODO: Crear Items
        await this.loadItems(userr);

        return true;
    }

    async deleteDatabase(){
        //TODO: Borrar Items
        await this.itemsReporitory.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        //TODO: Borrar Users
        await this.usersReporitory.createQueryBuilder()
            .delete()
            .where({})
            .execute();

    }

    async loadUsers(): Promise<User>{
        const users = [];
        for( const user of SEED_USERS ){
            users.push( await this.usersService.create( user ) )
        }
        return users[1];
    }
    
    async loadItems(user: User): Promise<void>{
        const itemsPromise = [];
        for( const item of SEED_ITEMS ){
            itemsPromise.push( await this.itemsService.create( user, item ) )
        }

        await Promise.all( itemsPromise );
    }


}
