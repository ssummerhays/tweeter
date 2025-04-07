import { UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { AbstractFactory } from "../../dao/factories/AbstractFactory";
import { UserDao } from "../../dao/interfaces/UserDao";

export class FollowService extends Service {
  private userDao: UserDao;

  constructor(factory: AbstractFactory) {
    super(factory);
    this.userDao = factory.createUserDao();
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.validateAuth(token);

    const result = await this.followDao.getPageOfFollowers(
      userAlias,
      pageSize,
      lastItem?.alias
    );
    const followerAliases = result.followerAliases;
    const followers = await Promise.all(
      followerAliases.map(async (followerAlias) => {
        const userResult = await this.userDao.getUserByAlias(followerAlias);
        if (!userResult) {
          throw new Error(`[Bad Request] User not found for alias: ${followerAlias}`);
        }
        const [user] = userResult;
        return user;
      })
    );

    return [followers, result.hasMore];
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.validateAuth(token);

    const result = await this.followDao.getPageOfFollowees(
      userAlias,
      pageSize,
      lastItem?.alias
    );
    const followeeAliases = result.followeeAliases;
    const followees = await Promise.all(
      followeeAliases.map(async (followeeAlias) => {
        const userResult = await this.userDao.getUserByAlias(followeeAlias);
        if (!userResult) {
          throw new Error(`[Bad Request] User not found for alias: ${followeeAlias}`);
        }
        const [user] = userResult;
        return user;
      })
    );

    return [followees, result.hasMore];
  }
}
