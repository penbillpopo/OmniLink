import { Account } from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { RandomGenerator } from '@ay/util';
import { Injectable } from '@nestjs/common';
import { IsEmail, IsString, Length } from 'class-validator';

@Injectable()
export class AccountHelperService {
  public generateSalt(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTVWXYZ0123456789'.split('');
    let salt = '';
    for (let i = 0; i < length; i++) {
      salt += chars[RandomGenerator.randomInt(chars.length)];
    }
    return salt;
  }

  public async ensureAccountNotExist(account: string) {
    const count = await Account.count({ where: { account } });
    if (count !== 0) {
      throw new Errors.ACCOUNT_EXIST();
    }
  }
}

export class AccountHelperDto {
  @IsString()
  @Length(2, 32, { message: '長度必須在 2 ~ 32 個字之間' })
  public name: string;

  @IsEmail()
  public account: string;

  @Length(8, 32, { message: '長度必須在 8 ~ 32 個字之間' })
  public password: string;

  public constructor(
    option: {
      name?: string;
      account?: string;
      password?: string;
    } = {},
  ) {
    this.name = option.name;
    this.account = option.account;
    this.password = option.password;
  }
}
