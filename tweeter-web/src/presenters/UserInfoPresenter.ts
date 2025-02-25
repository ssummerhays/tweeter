import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { MessageView, Presenter } from "./Presenter";

export class UserInfoPresenter extends Presenter<MessageView> {
  private userService: UserService;

  public isFollower: boolean = false;
  public followeeCount: number = -1;
  public followerCount: number = -1;
  public isLoading: boolean = false;

  public constructor(view: MessageView) {
    super(view);
    this.userService = new UserService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    await this.doFailuareReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.isFollower = false;
      } else {
        this.isFollower = await this.userService.getIsFollowerStatus(
          authToken!,
          currentUser!,
          displayedUser!
        );
      }
    }, "determine follower status");
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    await this.doFailuareReportingOperation(async () => {
      this.followeeCount = await this.userService.getFolloweeCount(
        authToken,
        displayedUser
      );
    }, "get followees count");
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    await this.doFailuareReportingOperation(async () => {
      this.followerCount = await this.userService.getFollowerCount(
        authToken,
        displayedUser
      );
    }, "get followers count");
  }

  public async followDisplayedUser(
    event: React.MouseEvent,
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    event.preventDefault();

    await this.doFailuareReportingOperation(async () => {
      this.isLoading = true;
      this.view.displayInfoMessage(`Following ${displayedUser.name}...`, 0);

      const [followerCount, followeeCount] = await this.userService.follow(
        authToken,
        displayedUser
      );

      this.isFollower = true;
      this.followerCount = followerCount;
      this.followeeCount = followeeCount;
    }, "follow user");

    this.view.clearLastInfoMessage();
    this.isLoading = false;
  }

  public async unfollowDisplayedUser(
    event: React.MouseEvent,
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    event.preventDefault();

    await this.doFailuareReportingOperation(async () => {
      this.isLoading = true;
      this.view.displayInfoMessage(`Unfollowing ${displayedUser.name}...`, 0);

      const [followerCount, followeeCount] = await this.userService.unfollow(
        authToken,
        displayedUser
      );

      this.isFollower = false;
      this.followerCount = followerCount;
      this.followeeCount = followeeCount;
    }, "unfollow user");

    this.view.clearLastInfoMessage();
    this.isLoading = false;
  }
}
