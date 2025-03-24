import {
  AuthToken,
  User,
  FakeData,
  PagedItemRequest,
  PagedItemResponse,
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
    const request: PagedItemRequest<User> = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem,
    };
    return await this.serverFacade.getMoreItems<
      PagedItemRequest<User>,
      PagedItemResponse<User>,
      User
    >(request, "followers");
  }

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedItemRequest<User> = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem,
    };
    return await this.serverFacade.getMoreItems<
      PagedItemRequest<User>,
      PagedItemResponse<User>,
      User
    >(request, "followee");
  }
}
