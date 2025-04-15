import { StatusDto, UserDto } from "tweeter-shared";
import { AbstractFactory } from "../../dao/factories/AbstractFactory";
import { Service } from "./Service";
import { FeedDao } from "../../dao/interfaces/FeedDao";
import { StoryDao } from "../../dao/interfaces/StoryDao";

export class StatusService extends Service {
  private feedDao: FeedDao;
  private storyDao: StoryDao;

  constructor(factory: AbstractFactory) {
    super(factory);
    this.feedDao = factory.createFeedStatusDao();
    this.storyDao = factory.createStoryStatusDao();
  }

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    this.validateAuth(token);
    const result = await this.feedDao.getStatuses(
      userAlias,
      pageSize,
      lastItem?.timestamp
    );

    const feedItems = result.statuses;
    const hasMore = result.hasMore;
    return [feedItems, hasMore];
  }

  public async loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    await this.validateAuth(token);
    const result = await this.storyDao.getStatuses(
      userAlias,
      pageSize,
      lastItem?.timestamp
    );

    const storyItems = result.statuses;
    const hasMore = result.hasMore;
    return [storyItems, hasMore];
  }

  public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
    await this.validateAuth(token);
    await this.storyDao.createStatus(newStatus.user.alias, newStatus);
  }

  public async updateFeeds(status: StatusDto, followers: string[]) {
    await this.feedDao.batchCreateAliasesStatus(followers, status);
  }
}
