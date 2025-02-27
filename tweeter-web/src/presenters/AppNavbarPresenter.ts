import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { MessageView, Presenter } from "./Presenter";

export interface AppNavbarView extends MessageView {
  clearUserInfo: () => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
  private _userService: UserService;

  public constructor(view: AppNavbarView) {
    super(view);
    this._userService = new UserService();
  }

  public get userService(): UserService {
    return this._userService;
  }

  public async logOut(authToken: AuthToken) {
    this.view.displayInfoMessage("Logging Out...", 0);

    await this.doFailuareReportingOperation(async () => {
      await this.userService.logout(authToken);

      this.view.clearLastInfoMessage();
      this.view.clearUserInfo();
    }, "log user out");
  }
}
