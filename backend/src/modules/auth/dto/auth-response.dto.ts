import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ type: [String] })
  permissions: string[];
}

export class AuthResponseDto {
  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ description: 'JWT Access Token de corta duración' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token rotativo' })
  refreshToken: string;
}
