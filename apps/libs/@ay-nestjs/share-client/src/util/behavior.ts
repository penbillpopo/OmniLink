import { WSClient } from '../client';

export abstract class Behavior {
  public constructor(public client: WSClient) {}
}
