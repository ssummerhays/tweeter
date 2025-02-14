import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";

export interface UserInfoView {
  displayErrorMessage: (message: string, bootstrapClasses?: string) => void;
  displayInfoMessage: (
    message: string,
    duration: number,
    bootstrapClasses?: string
  ) => void;
  clearLastInfoMessage: () => void;
}

export class UserInfoPresenter {
  private view: UserInfoView;
  private userService: UserService;

  public isFollower: boolean = false;
  public followeeCount: number = -1;
  public followerCount: number = -1;
  public isLoading: boolean = false;

  public constructor(view: UserInfoView) {
    this.view = view;
    this.userService = new UserService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    try {
      if (currentUser === displayedUser) {
        this.isFollower = false;
      } else {
        this.isFollower = await this.userService.getIsFollowerStatus(
          authToken!,
          currentUser!,
          displayedUser!
        );
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to determine follower status because of exception: ${error}`
      );
    }
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    try {
      this.followeeCount = await this.userService.getFolloweeCount(
        authToken,
        displayedUser
      );
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followees count because of exception: ${error}`
      );
    }
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    try {
      this.followerCount = await this.userService.getFollowerCount(
        authToken,
        displayedUser
      );
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followers count because of exception: ${error}`
      );
    }
  }

  public async followDisplayedUser(
    event: React.MouseEvent,
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    event.preventDefault();

    try {
      this.isLoading = true;
      this.view.displayInfoMessage(`Following ${displayedUser.name}...`, 0);

      const [followerCount, followeeCount] = await this.userService.follow(
        authToken,
        displayedUser
      );

      this.isFollower = true;
      this.followerCount = followerCount;
      this.followeeCount = followeeCount;
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to follow user because of exception: ${error}`
      );
    } finally {
      this.view.clearLastInfoMessage();
      this.isLoading = false;
    }
  }

  public async unfollowDisplayedUser(
    event: React.MouseEvent,
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    event.preventDefault();

    try {
      this.isLoading = true;
      this.view.displayInfoMessage(`Unfollowing ${displayedUser.name}...`, 0);

      const [followerCount, followeeCount] = await this.userService.unfollow(
        authToken,
        displayedUser
      );

      this.isFollower = false;
      this.followerCount = followerCount;
      this.followeeCount = followeeCount;
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to unfollow user because of exception: ${error}`
      );
    } finally {
      this.view.clearLastInfoMessage();
      this.isLoading = false;
    }
  }
}
