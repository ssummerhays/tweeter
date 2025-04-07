import {
  AuthResponse,
  AuthToken,
  AuthTokenDto,
  FollowerStatusRequest,
  FollowerStatusResponse,
  GetFollowCountResponse,
  GetUserRequest,
  GetUserResponse,
  LoginRequest,
  LogoutRequest,
  PagedItemRequest,
  PagedItemResponse,
  PostStatusRequest,
  RegisterRequest,
  Status,
  StatusDto,
  TokenUserRequest,
  TweeterResponse,
  UpdateFollowResponse,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

type ItemDescription = "followers" | "followee" | "feed" | "story";
type ItemDto = UserDto | StatusDto;
type UserType = "followers" | "followee";
type UpdateType = "follow" | "unfollow";
type AuthRequest = LoginRequest | RegisterRequest;
type AuthType = "login" | "register";

export class ServerFacade {
  private SERVER_URL =
    "https://a01hhxr3qe.execute-api.us-west-2.amazonaws.com/prod";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public constructor() {}

  public async getMoreItems<
    REQ extends PagedItemRequest<ItemDto>,
    RES extends PagedItemResponse<ItemDto>,
    Item extends User | Status
  >(request: REQ, description: ItemDescription): Promise<[Item[], boolean]> {
    let endpoint: string;
    if (description === "followers" || description === "followee") {
      endpoint = `/${description}/list`;
    } else {
      endpoint = `/status/${description}`;
    }

    const response = await this.clientCommunicator.doPost<REQ, RES>(
      request,
      endpoint
    );

    let items: Item[] | null;
    if (description === "followers" || description === "followee") {
      items =
        response.success && response.items
          ? (response.items
              .filter((dto): dto is UserDto => (dto as UserDto) !== undefined)
              .map((dto) => User.fromDto(dto) as User) as Item[])
          : null;
    } else {
      items =
        response.success && response.items
          ? (response.items
              .filter(
                (dto): dto is StatusDto => (dto as StatusDto) !== undefined
              )
              .map((dto) => Status.fromDto(dto) as Status) as Item[])
          : null;
    }

    let descriptionString: string = description;
    if (description === "followee") {
      descriptionString = "followees";
    } else if (description === "feed") {
      descriptionString = "feeds";
    } else if (description === "story") {
      descriptionString = "stories";
    }

    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(`No ${descriptionString} found`);
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

  public async authenticate<REQ extends AuthRequest>(
    request: REQ,
    endpoint: AuthType
  ): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<REQ, AuthResponse>(
      request,
      `/auth/${endpoint}`
    );

    const user: User | null = this.convertUserDtoToUser(response.user);
    const authToken: AuthToken | null = this.convertAuthDtoToAuth(
      response.authToken
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

  public async logout(request: LogoutRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      LogoutRequest,
      TweeterResponse
    >(request, "/auth/logout");

    // Handle errors
    if (!response.success) {
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

  private convertAuthDtoToAuth(authDto: AuthTokenDto): AuthToken | null {
    if (authDto == null) {
      return null;
    }
    return new AuthToken(authDto.token, authDto.timestamp);
  }
}
