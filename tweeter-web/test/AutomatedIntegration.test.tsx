import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { ServerFacade } from "../src/model/network/ServerFacade";
import {
  LoginRequest,
  PagedItemRequest,
  PagedItemResponse,
  PagedStatusItemRequest,
  Status,
  StatusDto,
} from "tweeter-shared";
import { PostStatusPresenter } from "../src/presenters/PostStatusPresenter";
import { MessageView } from "../src/presenters/Presenter";
import { StatusService } from "../src/model/service/StatusService";

import "isomorphic-fetch";

describe("Automated Integration Test", () => {
  let mockMessageView: MessageView;
  let postStatusPresenter: PostStatusPresenter;

  const serverFacade: ServerFacade = new ServerFacade();
  const loginRequest: LoginRequest = {
    alias: "@test",
    password: "test",
  };
  const mouseEvent = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
  }) as unknown as React.MouseEvent;
  let storyRequest: PagedStatusItemRequest;

  beforeEach(() => {
    mockMessageView = mock<MessageView>();
    const mockMessageViewInstance = instance(mockMessageView);

    const postStatusPresenterSpy = spy(
      new PostStatusPresenter(mockMessageViewInstance)
    );
    postStatusPresenter = instance(postStatusPresenterSpy);
  });

  it("starts", async () => {
    const beginTime = new Date().getTime();
    const [user, token] = await serverFacade.authenticate(
      loginRequest,
      "login"
    );

    await postStatusPresenter.submitPost(mouseEvent, user, token, "Test Post");
    verify(mockMessageView.displayInfoMessage("Posting status...", 0)).once();
    verify(
      mockMessageView.displayInfoMessage("Status posted!", anything())
    ).once();

    storyRequest = {
      token: token.token,
      userAlias: user.alias,
      pageSize: 25,
      lastItem: null,
    };

    const [statuses, hasMore] = await serverFacade.getMoreItems<
      PagedItemRequest<StatusDto>,
      PagedItemResponse<StatusDto>,
      Status
    >(storyRequest, "story");
    const testStatus = statuses[0];

    const endTime = new Date().getTime();

    expect(testStatus.post).toBe("Test Post");
    expect(testStatus.user).toStrictEqual(user);
    expect(testStatus.timestamp).toBeGreaterThan(beginTime);
    expect(testStatus.timestamp).toBeLessThan(endTime);
  }, 10500);
});
