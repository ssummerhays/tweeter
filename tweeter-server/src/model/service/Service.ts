import { AbstractFactory } from "../../dao/factories/AbstractFactory";
import { AuthDao } from "../../dao/interfaces/AuthDao";
import { FollowDao } from "../../dao/interfaces/FollowDao";

export abstract class Service {
  protected authDao: AuthDao;
  protected followDao: FollowDao;

  constructor(factory: AbstractFactory) {
    this.authDao = factory.createAuthDao();
    this.followDao = factory.createFollowDao();
  }

  protected async validateAuth(token: string) {
    const userAlias = await this.authDao.getAliasByAuth(token);

    const currentTime = new Date().getTime();
    const tokenTime = await this.authDao.getTimestampByAuth(token);
    const oneHourInMs = 60 * 60 * 1000;

    if (!userAlias || currentTime - tokenTime > oneHourInMs) {
      throw new Error("[Bad Request] Invalid or Expired AuthToken");
    }
    return userAlias;
  }
}
