import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty() id!:        number;
  @ApiProperty() name!:      string;
  @ApiProperty() email!:     string;
  @ApiProperty() sexo!:      string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}