import { Pipe } from '@angular/core';
import { TradeBotService } from '../pages/trade-bot/trade-bot.service';

@Pipe({
  name: 'botName',
  standalone: true,
})
export class BotNamePipe {
  public constructor(private readonly _tradeBotService: TradeBotService) {}

  public async transform(id: number): Promise<string> {
    const bot = await this._tradeBotService.getBotById(id);
    return bot?.name;
  }
}
