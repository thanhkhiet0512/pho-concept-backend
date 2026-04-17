import { IsEmail, IsString, MinLength, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: "owner@phoconcept.com" })
  @IsDefined()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Demo@123456" })
  @IsDefined()
  @IsString()
  @MinLength(6)
  password!: string;
}
