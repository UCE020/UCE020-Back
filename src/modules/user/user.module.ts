import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { ProfileController } from './profile.controller';
import { UserController } from './user.controller';

@Module({
  controllers: [ProfileController, UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}