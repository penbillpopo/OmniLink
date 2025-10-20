import { BasicSessionDto } from '@ay-nestjs/share-server';
import { UserDto } from './dto/user.dto';

export class SessionDto extends BasicSessionDto<UserDto> {}
