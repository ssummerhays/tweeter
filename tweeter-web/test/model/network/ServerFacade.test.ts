import { RegisterRequest } from "tweeter-shared";
import { ServerFacade } from "../../../src/model/network/ServerFacade";

import "isomorphic-fetch";

describe("Server Facade", () => {
  const serverFacade: ServerFacade = new ServerFacade();

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

    expect(user.alias).toBe("@allen");
    expect(user.firstName).toBe("Allen");
    expect(user.lastName).toBe("Anderson");
    expect(user.imageUrl).toBe(
      "https://faculty.cs.byu.edu/~jwilkerson/cs340/tweeter/images/donald_duck.png"
    );

    expect(authToken.token).toBeDefined();
    expect(authToken.timestamp).toBeDefined();
  });
});
