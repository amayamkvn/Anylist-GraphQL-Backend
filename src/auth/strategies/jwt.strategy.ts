import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { User } from "../../users/entities/user.entity";
import { JwtPayloadInterface } from "../interfaces/jwt-payload.interface";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        configService: ConfigService,
        private readonly _authService: AuthService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate( payload: JwtPayloadInterface ): Promise<User>{
        
        const { id } = payload;
        const user = await this._authService.validateUser( id );
        console.log(user);
        
        return user;
    }

}