import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";

export interface UserNavigationView {
  displayErrorMessage: (message: string, bootstrapClasses?: string) => void;
  setDisplayedUser: (user: User) => void;
  currentUser: User | null;
  authToken: AuthToken | null;
}

export class UserNavigationPresenter {
  private view: UserNavigationView;
  private userService: UserService;

  public constructor(view: UserNavigationView) {
    this.view = view;
    this.userService = new UserService();
  }

  navigateToUser = async (
    event: React.MouseEvent
  ): Promise<void> => {
    event.preventDefault();

    try {
      const alias = this.extractAlias(event.target.toString());

      const user = await this.userService.getUser(this.view.authToken!, alias);

      if (!!user) {
        if (this.view.currentUser!.equals(user)) {
          this.view.setDisplayedUser(this.view.currentUser!);
        } else {
          this.view.setDisplayedUser(user);
        }
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get user because of exception: ${error}`
      );
    }
  };

  extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
  };
}
