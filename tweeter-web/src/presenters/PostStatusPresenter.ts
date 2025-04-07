import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { MessageView, Presenter } from "./Presenter";

export class PostStatusPresenter extends Presenter<MessageView> {
  private _statusService: StatusService;

  public isLoading = false;

  public constructor(view: MessageView) {
    super(view);
    this._statusService = new StatusService();
  }

  public get statusService(): StatusService {
    return this._statusService;
  }

  public async submitPost(
    event: React.MouseEvent,
    currentUser: User,
    authToken: AuthToken,
    post: string
  ) {
    event.preventDefault();

    await this.doFailuareReportingOperation(async () => {
      this.isLoading = true;
      this.view.displayInfoMessage("Posting status...", 0);

      const status = new Status(post, currentUser, Date.now());

      await this.statusService.postStatus(authToken, status);

      this.view.displayInfoMessage("Status posted!", 2000);
    }, "post the status");

    this.view.clearLastInfoMessage();
    this.isLoading = false;
  }

  public checkButtonStatus(
    post: string,
    authToken: AuthToken,
    currentUser: User
  ) {
    return !post.trim() || !authToken || !currentUser;
  }
}
