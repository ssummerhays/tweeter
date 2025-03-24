import {
  AuthToken,
  User,
  PagedItemRequest,
  PagedItemResponse,
  UserDto,
} from "tweeter-shared";
import { ServerFacade } from "../network/ServerFacade";

export class FollowService {
  private serverFacade: ServerFacade = new ServerFacade();

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedItemRequest<UserDto> = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem?.dto ?? null,
    };
    return await this.serverFacade.getMoreItems<
      PagedItemRequest<UserDto>,
      PagedItemResponse<UserDto>,
      User
    >(request, "followers");
  }

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedItemRequest<UserDto> = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem?.dto ?? null,
    };
    return await this.serverFacade.getMoreItems<
      PagedItemRequest<UserDto>,
      PagedItemResponse<UserDto>,
      User
    >(request, "followee");
  }
}
