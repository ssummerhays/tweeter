import { User, AuthToken } from "tweeter-shared";
import { View, Presenter } from "./Presenter";
import { UserService } from "../model/service/UserService";

export interface AuthenticationView extends View {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export class AuthenticationPresenter extends Presenter<AuthenticationView> {
  protected userService: UserService;

  public isLoading: boolean = false;
  public noError: boolean = true;

  public constructor(view: AuthenticationView) {
    super(view);
    this.userService = new UserService();
  }

  public async doAuthenticate(
    authenticate: () => Promise<[User, AuthToken]>,
    operationDescription: string,
    rememberMe: boolean
  ): Promise<void> {
    await this.doFailuareReportingOperation(async () => {
      this.isLoading = true;

      const [user, authToken] = await authenticate();

      this.view.updateUserInfo(user, user, authToken, rememberMe);
    }, operationDescription);

    this.isLoading = false;
  }
}
