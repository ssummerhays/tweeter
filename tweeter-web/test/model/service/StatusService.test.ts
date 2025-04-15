import { AuthToken } from "tweeter-shared";
import { StatusService } from "../../../src/model/service/StatusService";

import "isomorphic-fetch";

describe.skip("Status Service", () => {
  const statusService = new StatusService();
  const authToken = new AuthToken("token", 100);

  it("gets a user's story pages", async () => {
    const [statusItems, hasMore] = await statusService.loadMoreStoryItems(
      authToken,
      "@allen",
      10,
      null
    );

    expect(statusItems.length).toBe(10);
    expect(statusItems[0].user.alias).toBe("@allen");

    expect(hasMore).toBe(true);
  });
});
