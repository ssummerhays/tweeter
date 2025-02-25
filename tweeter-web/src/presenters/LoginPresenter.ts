import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { Presenter, View } from "./Presenter";

export interface LoginView extends View {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export class LoginPresenter extends Presenter<LoginView> {
  private userService: UserService;

  public isLoading: boolean = false;
  public noError: boolean = true;

  public constructor(view: LoginView) {
    super(view);
    this.userService = new UserService();
  }

  public checkSubmitButtonStatus(alias: string, password: string): boolean {
    return !alias || !password;
  }

  public async doLogin(alias: string, password: string, rememberMe: boolean) {
    await this.doFailuareReportingOperation(async () => {
      this.isLoading = true;

      const [user, authToken] = await this.userService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);
    }, "log user in");
    
    this.isLoading = false;
  }
}
