import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { Item } from 'src/items/entities/item.entity';
import { SEED_USERS, SEED_ITEMS, SEED_LISTS } from './data/seed-data';
import { ItemsService } from '../items/items.service';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {

    private isProd: Boolean;

    constructor(
        @InjectRepository(User)
        private readonly usersReporitory: Repository<User>,
        @InjectRepository(Item)
        private readonly itemsReporitory: Repository<Item>,
        @InjectRepository(ListItem)
        private readonly listItemRepo: Repository<ListItem>,
        @InjectRepository(List)
        private readonly listRepository: Repository<List>,

        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listService: ListsService,
        private readonly listitemService: ListItemService,

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

        //TODO: Crear Listas
        const list = await this.loadList( userr );

        //TODO: Crear ListItem
        const items = await this.itemsService.findAll( userr, {limit: 10}, {} )
        await this.loadListItem( list, items );

        return true;
    }

    async deleteDatabase(){
        //TODO: Borrar las List-Item
        await this.listItemRepo.createQueryBuilder()
            .delete()
            .where({})
            .execute();
            
        //TODO: Borrar Lists
        await this.listRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

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

    async loadList( user: User ): Promise<List>{
        const lists = [];
        for( const list of SEED_LISTS ){
            lists.push( await this.listService.create( user, list ) )
        }
        return lists[0];
    }
    
    async loadListItem( list: List, items: Item[] ){
        for( const item of items ){
            await this.listitemService.create({
                quantity: Math.round( Math.random() *10 ),
                completed: Math.round( Math.random() *1 ) === 0 ? false : true,
                listId: list.id,
                itemId: item.id
            });
        }

    }

}
