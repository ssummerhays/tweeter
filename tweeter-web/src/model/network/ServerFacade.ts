import {
  PagedStatusItemRequest,
  PagedStatusItemResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  Status,
  TokenUserRequest,
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
}
