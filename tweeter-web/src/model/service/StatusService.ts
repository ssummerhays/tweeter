import {
  AuthToken,
  Status,
  PagedItemRequest,
  PagedItemResponse,
  PostStatusRequest,
  StatusDto,
} from "tweeter-shared";
import { ServerFacade } from "../network/ServerFacade";

export class StatusService {
  private serverFacade: ServerFacade = new ServerFacade();

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request: PagedItemRequest<StatusDto> = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem?.dto ?? null,
    };
    return await this.serverFacade.getMoreItems<
      PagedItemRequest<StatusDto>,
      PagedItemResponse<StatusDto>,
      Status
    >(request, "feed");
  }

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request: PagedItemRequest<StatusDto> = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem?.dto ?? null,
    };
    return await this.serverFacade.getMoreItems<
      PagedItemRequest<StatusDto>,
      PagedItemResponse<StatusDto>,
      Status
    >(request, "story");
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    // Pause so we can see the logging out message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    const request: PostStatusRequest = {
      token: authToken.token,
      newStatus: newStatus.dto,
    };
    this.serverFacade.postStatus(request);
  }
}
