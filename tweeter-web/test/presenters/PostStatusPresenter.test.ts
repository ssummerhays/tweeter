import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { StatusService } from "../../src/model/service/StatusService";
import { PostStatusPresenter } from "../../src/presenters/PostStatusPresenter";
import { MessageView } from "../../src/presenters/Presenter";
import { AuthToken, Status, User } from "tweeter-shared";

describe("PostStatusPresenter", () => {
  let mockMessageView: MessageView;
  let postStatusPresenter: PostStatusPresenter;
  let mockStatusService: StatusService;

  const post = "Test status";
  const authToken = new AuthToken("abcdef", Date.now());
  const currentUser = new User("Test", "User", "testUser", "imageURL");
  const mouseEvent = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
  }) as unknown as React.MouseEvent;

  beforeEach(() => {
    mockMessageView = mock<MessageView>();
    const mockMessageViewInstance = instance(mockMessageView);

    const postStatusPresenterSpy = spy(
      new PostStatusPresenter(mockMessageViewInstance)
    );
    postStatusPresenter = instance(postStatusPresenterSpy);

    mockStatusService = mock<StatusService>();
    const mockStatusServiceInstance = instance(mockStatusService);

    when(postStatusPresenterSpy.statusService).thenReturn(
      mockStatusServiceInstance
    );
  });

  it("tells the view to display a posting status message", async () => {
    await postStatusPresenter.submitPost(
      mouseEvent,
      currentUser,
      authToken,
      post
    );
    verify(mockMessageView.displayInfoMessage("Posting status...", 0)).once();
  });

  it("calls postStatus on the post status service with the correct status string and auth token", async () => {
    await postStatusPresenter.submitPost(
      mouseEvent,
      currentUser,
      authToken,
      post
    );
    verify(mockStatusService.postStatus(authToken, anything())).once();
    const status: Status = capture(mockStatusService.postStatus).last()[1];
    expect(status.post).toEqual("Test status");
  });

  it("tells the view to clear the last info message, clear the post, and display a status posted message when successful", async () => {
    await postStatusPresenter.submitPost(
      mouseEvent,
      currentUser,
      authToken,
      post
    );
    verify(mockMessageView.clearLastInfoMessage()).once();
    verify(mockMessageView.displayInfoMessage("Status posted!", 2000)).once();
  });

  it("tells the view to display an error message and clear the last info message and does not tell it to clear the post or display a status posted message when postStatus fails", async () => {
    const error = new Error("Post status failed");
    when(mockStatusService.postStatus(authToken, anything())).thenThrow(error);

    await postStatusPresenter.submitPost(
      mouseEvent,
      currentUser,
      authToken,
      post
    );
    verify(
      mockMessageView.displayErrorMessage(
        "Failed to post the status because of exception: Post status failed"
      )
    ).once();

    verify(mockMessageView.clearLastInfoMessage()).once();
  });
});
