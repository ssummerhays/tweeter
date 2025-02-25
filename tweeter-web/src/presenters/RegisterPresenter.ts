import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { Buffer } from "buffer";
import { ChangeEvent } from "react";
import { Presenter, View } from "./Presenter";

export interface RegisterView extends View {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export class RegisterPresenter extends Presenter<RegisterView> {
  private userService: UserService;

  public isLoading: boolean = false;
  public noError: boolean = true;

  public imageUrl: string = "";
  public imageBytes: Uint8Array = new Uint8Array();
  public imageFileExtension: string = "";

  public constructor(view: RegisterView) {
    super(view);
    this.userService = new UserService();
  }

  public async doRegister(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    rememberMe: boolean
  ) {
    await this.doFailuareReportingOperation(async () => {
      this.isLoading = true;

      const [user, authToken] = await this.userService.register(
        firstName,
        lastName,
        alias,
        password,
        this.imageBytes,
        this.imageFileExtension
      );

      this.view.updateUserInfo(user, user, authToken, rememberMe);
    }, "register user");

    this.isLoading = false;
  }

  public handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    this.handleImageFile(file);
  }

  public handleImageFile(file: File | undefined) {
    if (file) {
      this.imageUrl = URL.createObjectURL(file);

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        this.imageBytes = bytes;
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = this.getFileExtension(file);
      if (fileExtension) {
        this.imageFileExtension = fileExtension;
      }
    } else {
      this.imageUrl = "";
      this.imageBytes = new Uint8Array();
    }
  }

  public getFileExtension(file: File): string | undefined {
    return file.name.split(".").pop();
  }

  public checkSubmitButtonStatus(
    firstName: string,
    lastName: string,
    alias: string,
    imageUrl: string,
    imageFileExtension: string,
    password: string
  ): boolean {
    return (
      !firstName ||
      !lastName ||
      !alias ||
      !password ||
      !imageUrl ||
      !imageFileExtension
    );
  }
}
