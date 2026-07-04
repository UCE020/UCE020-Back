import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty() id!:        number;
  @ApiProperty() nome!:      string;
  @ApiProperty() email!:     string;
  @ApiProperty() sexo!:      string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}