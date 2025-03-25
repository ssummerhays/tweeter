import {
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

describe("Server Facade", () => {
  const serverFacade: ServerFacade = new ServerFacade();
  const allen = new User(
    "Allen",
    "Anderson",
    "@allen",
    "https://faculty.cs.byu.edu/~jwilkerson/cs340/tweeter/images/donald_duck.png"
  );

  it("registers a user", async () => {
    const request: RegisterRequest = {
      firstName: "firstName",
      lastName: "lastName",
      alias: "alias",
      password: "password",
      userImageBytesString: "userImageBytesString",
      imageFileExtension: "imageFileExtension",
    };

    const [user, authToken] = await serverFacade.authenticate(
      request,
      "register"
    );

    expect(user.alias).toBe(allen.alias);
    expect(user.firstName).toBe(allen.firstName);
    expect(user.lastName).toBe(allen.lastName);
    expect(user.imageUrl).toBe(allen.imageUrl);

    expect(authToken.token).toBeDefined();
    expect(authToken.timestamp).toBeDefined();
  });

  it("gets followers", async () => {
    const request: PagedUserItemRequest = {
      token: "token",
      userAlias: "alias",
      pageSize: 10,
      lastItem: null,
    };

    const [followers, hasMore] = await serverFacade.getMoreItems<
      PagedItemRequest<UserDto>,
      PagedItemResponse<UserDto>,
      User
    >(request, "followers");

    expect(followers.length).toBe(10);
    expect(followers[0].alias).toBe(allen.alias);

    expect(hasMore).toBe(true);
  });

  it("gets followees count", async () => {
    const request: TokenUserRequest = {
      token: "token",
      user: allen,
    };

    const count = await serverFacade.getCounts(request, "followee");

    expect(count).toBeDefined();
    expect(count).toBeGreaterThan(0);
  });

  it("gets followers count", async () => {
    const request: TokenUserRequest = {
      token: "token",
      user: allen,
    };

    const count = await serverFacade.getCounts(request, "followers");

    expect(count).toBeDefined();
    expect(count).toBeGreaterThan(0);
  });
});
