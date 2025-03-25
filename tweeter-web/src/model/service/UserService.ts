import {
  User,
  AuthToken,
  LoginRequest,
  RegisterRequest,
  FollowerStatusRequest,
  TokenUserRequest,
  GetUserRequest,
  LogoutRequest,
} from "tweeter-shared";
import { Buffer } from "buffer";
import { ServerFacade } from "../network/ServerFacade";

export class UserService {
  private serverFacade: ServerFacade = new ServerFacade();
  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    const request: LoginRequest = {
      alias: alias,
      password: password,
    };

    return await this.serverFacade.authenticate<LoginRequest>(request, "login");
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    // Not neded now, but will be needed when you make the request to the server in milestone 3
    const imageStringBase64: string =
      Buffer.from(userImageBytes).toString("base64");

    const request: RegisterRequest = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      password: password,
      userImageBytesString: imageStringBase64,
      imageFileExtension: imageFileExtension,
    };

    return await this.serverFacade.authenticate<RegisterRequest>(
      request,
      "register"
    );
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    const request: FollowerStatusRequest = {
      token: authToken.token,
      user: user.dto,
      selectedUser: selectedUser.dto,
    };

    return await this.serverFacade.getFollowerStatus(request);
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: TokenUserRequest = {
      token: authToken.token,
      user: user.dto,
    };

    return await this.serverFacade.getCounts(request, "followee");
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: TokenUserRequest = {
      token: authToken.token,
      user: user.dto,
    };

    return await this.serverFacade.getCounts(request, "followers");
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: TokenUserRequest = {
      token: authToken.token,
      user: userToFollow,
    };

    return await this.serverFacade.updateFollowStatus(request, "follow");
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: TokenUserRequest = {
      token: authToken.token,
      user: userToUnfollow,
    };

    return await this.serverFacade.updateFollowStatus(request, "unfollow");
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    const request: GetUserRequest = {
      token: authToken.token,
      alias: alias,
    };

    return await this.serverFacade.getUser(request);
  }

  public async logout(authToken: AuthToken): Promise<void> {
    const request: LogoutRequest = {
      token: authToken.token,
    };

    await this.serverFacade.logout(request);
  }
}
