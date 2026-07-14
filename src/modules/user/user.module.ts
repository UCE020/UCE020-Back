import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { UserProfileController } from './profile.controller';
import { UserController } from './user.controller';
import { AvatarStorageService } from './avatar-storage.service';
import { SupabaseStorageModule } from 'src/common/storage/supabase-storage.module';

@Module({
  imports: [SupabaseStorageModule],
  controllers: [UserProfileController, UserController],
  providers: [UserService, UserRepository, AvatarStorageService],
  exports: [UserService],
})
export class UserModule {}
