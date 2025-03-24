import {
  AuthResponse,
  AuthToken,
  FollowerStatusRequest,
  FollowerStatusResponse,
  GetFollowCountResponse,
  GetUserRequest,
  GetUserResponse,
  LoginRequest,
  PagedStatusItemRequest,
  PagedStatusItemResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  PostStatusRequest,
  Status,
  TokenUserRequest,
  TweeterResponse,
  UpdateFollowResponse,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

type UserType = "followers" | "followee";
type StatusType = "feed" | "story";
type UpdateType = "follow" | "unfollow";

export class ServerFacade {
  private SERVER_URL = "TODO: Set this value.";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreUsers(
    request: PagedUserItemRequest,
    userType: UserType
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, `/${userType}/list`);

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    const userTypeString = userType === "followers" ? "followers" : "followees";
    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(`No ${userTypeString} found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  public async getMoreStatuses(
    request: PagedStatusItemRequest,
    statusType: StatusType
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, `/${statusType}/list`);

    // Convert the StatusDto array returned by ClientCommunicator to a Status array
    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto) => Status.fromDto(dto) as Status)
        : null;

    const statusTypeString = statusType === "story" ? "stories" : "feeds";
    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(`No ${statusTypeString} found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  public async updateFollowStatus(
    request: TokenUserRequest,
    updateType: UpdateType
  ): Promise<[number, number]> {
    const response = await this.clientCommunicator.doPost<
      TokenUserRequest,
      UpdateFollowResponse
    >(request, `/user/${updateType}`);

    // Handle errors
    if (response.success) {
      return [response.followeeCount, response.followerCount];
    } else {
      console.error(response);
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  public async postStatus(request: PostStatusRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      PostStatusRequest,
      TweeterResponse
    >(request, "/status/post");

    // Handle errors
    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  public async getCounts(
    request: TokenUserRequest,
    endpoint: UserType
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      TokenUserRequest,
      GetFollowCountResponse
    >(request, `/${endpoint}/count`);

    // Handle errors
    if (response.success) {
      return response.count;
    } else {
      console.error(response);
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  public async getFollowerStatus(
    request: FollowerStatusRequest
  ): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      FollowerStatusRequest,
      FollowerStatusResponse
    >(request, "/user/followerStatus");

    // Handle errors
    if (response.success) {
      return response.isFollower;
    } else {
      console.error(response);
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  public async getUser(request: GetUserRequest): Promise<User> {
    const response = await this.clientCommunicator.doPost<
      GetUserRequest,
      GetUserResponse
    >(request, "/user");

    const user: User | null = this.convertUserDtoToUser(response.user);

    // Handle errors
    if (response.success) {
      if (user == null) {
        throw new Error("No user found");
      } else {
        return user;
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      LoginRequest,
      AuthResponse
    >(request, "/auth/login");

    const user: User | null = this.convertUserDtoToUser(response.user);
    const authToken: AuthToken | null = new AuthToken(
      response.authToken.token,
      response.authToken.timestamp
    );

    // Handle errors
    if (response.success) {
      if (user == null || authToken == null) {
        throw new Error("No user or authToken found");
      }
      return [user, authToken];
    } else {
      console.error(response);
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  private convertUserDtoToUser(userDto: UserDto | null): User | null {
    if (userDto == null) {
      return null;
    }
    return User.fromDto(userDto) as User;
  }
}
