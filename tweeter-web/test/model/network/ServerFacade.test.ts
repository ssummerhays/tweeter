import {
  AuthToken,
  PagedItemRequest,
  PagedItemResponse,
  PagedUserItemRequest,
  RegisterRequest,
  TokenUserRequest,
  User,
  UserDto,
} from "tweeter-shared";
import { ServerFacade } from "../../../src/model/network/ServerFacade";

import "isomorphic-fetch";

describe.skip("Server Facade", () => {
  const serverFacade: ServerFacade = new ServerFacade();
  const testUser = new User(
    "Test",
    "User",
    "@@alias",
    "userImageBytesString.imageFileExtension"
  );
  let userAuthToken: AuthToken;

  it("registers a user", async () => {
    const request: RegisterRequest = {
      firstName: "Test",
      lastName: "User",
      alias: "@alias",
      password: "password",
      userImageBytesString: "userImageBytesString",
      imageFileExtension: "imageFileExtension",
    };

    const [user, authToken] = await serverFacade.authenticate(
      request,
      "register"
    );

    expect(user.alias).toBe(testUser.alias);
    expect(user.firstName).toBe(testUser.firstName);
    expect(user.lastName).toBe(testUser.lastName);
    expect(user.imageUrl).toBe(testUser.imageUrl);

    expect(authToken.token).toBeDefined();
    expect(authToken.timestamp).toBeDefined();
    userAuthToken = authToken;
  });

  it("gets followers", async () => {
    const request: PagedUserItemRequest = {
      token: userAuthToken.token,
      userAlias: "alias",
      pageSize: 10,
      lastItem: null,
    };

    const [followers, hasMore] = await serverFacade.getMoreItems<
      PagedItemRequest<UserDto>,
      PagedItemResponse<UserDto>,
      User
    >(request, "followers");

    expect(followers.length).toBe(0);

    expect(hasMore).toBe(false);
  });

  it("gets followees count", async () => {
    const request: TokenUserRequest = {
      token: userAuthToken.token,
      user: testUser,
    };

    const count = await serverFacade.getCounts(request, "followee");

    expect(count).toBeDefined();
    expect(count).toBe(0);
  });

  it("gets followers count", async () => {
    const request: TokenUserRequest = {
      token: userAuthToken.token,
      user: testUser,
    };

    const count = await serverFacade.getCounts(request, "followers");

    expect(count).toBeDefined();
    expect(count).toBe(0);
  });
});
