import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";

export interface RegisterView {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  displayErrorMessage: (message: string, bootstrapClasses?: string) => void;
}

export class RegisterPresenter {
  private view: RegisterView;
  private userService: UserService;

  public isLoading: boolean = false;
  public noError: boolean = true;

  public imageUrl: string = "";
  public imageBytes: Uint8Array = new Uint8Array();
  public imageFileExtension: string = "";

  public constructor(view: RegisterView) {
    this.view = view;
    this.userService = new UserService();
  }

  public doRegister = async (
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array,
    imageFileExtension: string,
    rememberMe: boolean
  ) => {
    try {
      this.isLoading = true;

      const [user, authToken] = await this.userService.register(
        firstName,
        lastName,
        alias,
        password,
        imageBytes,
        imageFileExtension
      );

      this.view.updateUserInfo(user, user, authToken, rememberMe);
    } catch (error) {
      this.noError = false;
      this.view.displayErrorMessage(
        `Failed to register user because of exception: ${error}`
      );
    } finally {
      this.isLoading = false;
    }
  };

  public getFileExtension(file: File): string | undefined {
    return file.name.split(".").pop();
  }

  public checkSubmitButtonStatus(firstName: string, lastName: string, alias: string, password: string, imageUrl: string, imageFileExtension: string): boolean {
    return (
      !firstName ||
      !lastName ||
      !alias ||
      !password ||
      !imageUrl ||
      !imageFileExtension
    );
  };
}
