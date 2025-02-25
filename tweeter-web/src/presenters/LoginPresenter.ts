import { AuthenticationPresenter } from "./AuthenticationPresenter";

export class LoginPresenter extends AuthenticationPresenter {
  public checkSubmitButtonStatus(alias: string, password: string): boolean {
    return !alias || !password;
  }

  public async doLogin(alias: string, password: string, rememberMe: boolean) {
    await this.doAuthenticate(
      async () => {
        return this.userService.login(alias, password);
      },
      "log user in",
      rememberMe
    );
  }
}
