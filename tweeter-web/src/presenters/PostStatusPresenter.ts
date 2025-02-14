import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";

export interface PostStatusView {
  displayInfoMessage: (
    message: string,
    duration: number,
    bootstrapClasses?: string
  ) => void;
  displayErrorMessage: (message: string, bootstrapClasses?: string) => void;
  clearLastInfoMessage: () => void;
}

export class PostStatusPresenter {
  private view: PostStatusView;
  private statusService: StatusService;

  public isLoading = false;
  public post = "";

  public constructor(view: PostStatusView) {
    this.view = view;
    this.statusService = new StatusService();
  }

  public async submitPost(
    event: React.MouseEvent,
    currentUser: User,
    authToken: AuthToken
  ) {
    event.preventDefault();

    try {
      this.isLoading = true;
      this.view.displayInfoMessage("Posting status...", 0);

      const status = new Status(this.post, currentUser, Date.now());

      await this.statusService.postStatus(authToken, status);

      this.post = "";
      this.view.displayInfoMessage("Status posted!", 2000);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`
      );
    } finally {
      this.view.clearLastInfoMessage();
      this.isLoading = false;
    }
  }

  public checkButtonStatus(post: string, authToken: AuthToken, currentUser: User) {
    return !post.trim() || !authToken || !currentUser;
  };
}
