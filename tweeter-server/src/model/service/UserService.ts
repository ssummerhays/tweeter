import { AuthToken, UserDto, AuthTokenDto } from "tweeter-shared";
import { Buffer } from "buffer";
import { UserDao } from "../../dao/interfaces/UserDao";
import { AbstractFactory } from "../../dao/factories/AbstractFactory";
import bcrypt from "bcryptjs";
import { S3DAO } from "../../dao/interfaces/S3Dao";
import { Service } from "./Service";
import { StatusDao } from "../../dao/interfaces/StatusDao";

export class UserService extends Service {
  private userDao: UserDao;
  private feedDao: StatusDao;
  private storyDao: StatusDao;
  private s3Dao: S3DAO;

  constructor(factory: AbstractFactory) {
    super(factory);
    this.userDao = factory.createUserDao();
    this.feedDao = factory.createFeedStatusDao();
    this.storyDao = factory.createStoryStatusDao();
    this.s3Dao = factory.createS3Dao();
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    if (!alias.startsWith("@")) {
      throw new Error("[Bad Request] alias must start with @");
    }
    const userResult = await this.userDao.getUserByAlias(alias);
    if (!userResult) {
      throw new Error("[Bad Request] Invalid alias");
    }

    const [user, hashedPassword] = userResult;

    const correctPassword = await bcrypt.compare(password, hashedPassword);
    if (!correctPassword) {
      throw new Error("[Bad Request] Invalid alias or password");
    }

    const authToken = AuthToken.Generate();

    await this.authDao.addToken(user.alias, authToken);

    return [user, this.getAuthTokenDto(authToken)];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    if (!alias.startsWith("@")) {
      throw new Error("[Bad Request] alias must start with @");
    }
    const existingUser = await this.userDao.getUserByAlias(alias);
    if (existingUser) {
      throw new Error("[Bad Request] Alias already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageStringBase64: string =
      Buffer.from(userImageBytes).toString("base64");
    const fileName = `${alias}_profile.${imageFileExtension}`;
    const url = await this.s3Dao.putImage(fileName, imageStringBase64);

    const newUser: UserDto = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      imageUrl: url,
    };

    await this.userDao.createUser(newUser, hashedPassword);

    const authToken = AuthToken.Generate();
    await this.authDao.addToken(alias, authToken);

    return [newUser, this.getAuthTokenDto(authToken)];
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    await this.validateAuth(token);
    const followResult = await this.followDao.getFollow(
      user.alias,
      selectedUser.alias
    );
    if (followResult == null) {
      return false;
    }
    return true;
  }

  public async getFolloweeCount(
    authToken: string,
    user: UserDto
  ): Promise<number> {
    await this.validateAuth(authToken);
    const userResult = await this.userDao.getUserByAlias(user.alias);
    if (!userResult) {
      throw new Error("[Bad Request] no user with given alias");
    } else {
      return userResult[3];
    }
  }

  public async getFollowerCount(
    authToken: string,
    user: UserDto
  ): Promise<number> {
    await this.validateAuth(authToken);
    const userResult = await this.userDao.getUserByAlias(user.alias);
    if (!userResult) {
      throw new Error("[Bad Request] no user with given alias");
    } else {
      return userResult[2];
    }
  }

  public async follow(
    token: string,
    userToFollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    await this.validateAuth(token);
    const userAlias = await this.authDao.getAliasByAuth(token);
    await this.followDao.createFollow(userAlias, userToFollow.alias);

    await this.userDao.updateFollowCounts(userAlias, 0, 1);
    await this.userDao.updateFollowCounts(userToFollow.alias, 1, 0);

    const followerCount = await this.getFollowerCount(token, userToFollow);
    const followeeCount = await this.getFolloweeCount(token, userToFollow);

    try {
      const statuses = (
        await this.storyDao.getStatuses(userToFollow.alias, 25, undefined)
      ).statuses;
      await this.feedDao.batchCreateStatus(userAlias, statuses);
    } catch (error) {
      console.log("User has not posted any statuses");
    }

    return [followerCount, followeeCount];
  }

  public async unfollow(
    token: string,
    userToUnfollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    const userAlias = await this.validateAuth(token);
    await this.followDao.deleteFollow(userAlias, userToUnfollow.alias);

    await this.userDao.updateFollowCounts(userAlias, 0, -1);
    await this.userDao.updateFollowCounts(userToUnfollow.alias, -1, 0);

    const followerCount = await this.getFollowerCount(token, userToUnfollow);
    const followeeCount = await this.getFolloweeCount(token, userToUnfollow);

    try {
      const statuses = (
        await this.storyDao.getStatuses(userToUnfollow.alias, 25, undefined)
      ).statuses;
      const deleteItems = statuses.map((status) => ({
        alias: userAlias,
        timestamp: status.timestamp,
      }));

      console.log("deleteItems", deleteItems);
      await this.feedDao.batchDeleteStatus(deleteItems);
    } catch (error) {
      console.log("User has not posted any statuses");
    }

    return [followerCount, followeeCount];
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    await this.validateAuth(token);
    const userResult = await this.userDao.getUserByAlias(alias);
    if (!userResult) {
      return null;
    }
    const user = userResult[0];
    return user;
  }

  public async logout(token: string): Promise<void> {
    await this.authDao.deleteToken(token);
  }

  public async getUserByToken(token: string) {
    const alias = await this.authDao.getAliasByAuth(token);
    return this.getUser(token, alias);
  }

  private getAuthTokenDto(authToken: AuthToken): AuthTokenDto {
    return {
      token: authToken.token,
      timestamp: authToken.timestamp,
    };
  }
}
