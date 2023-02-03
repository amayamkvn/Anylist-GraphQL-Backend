import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport'
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config/dist';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  providers: [
    AuthResolver, 
    AuthService,
    JwtStrategy
  ],
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configServise: ConfigService ) => {
        return {
          secret: configServise.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '4h'
          }
        }
      }
    }),

    UsersModule,
  ],
  exports: [
    JwtStrategy, 
    PassportModule, 
    JwtModule
  ]
})
export class AuthModule {}
