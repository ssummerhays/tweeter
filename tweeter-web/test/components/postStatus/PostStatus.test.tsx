import { anything, instance, mock, verify } from "@typestrong/ts-mockito";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import { AuthToken, User } from "tweeter-shared";
import useUserInfo from "../../../src/components/userInfo/UserInfoHook";
import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { PostStatusPresenter } from "../../../src/presenters/PostStatusPresenter";

jest.mock("../../../src/components/userInfo/UserInfoHook", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHook"),
  __esModule: true,
  default: jest.fn(),
}));

describe("PostStatus Component", () => {
  const mockUser = mock<User>();
  const mockUserInstance = instance(mockUser);
  const mockAuthToken = mock<AuthToken>();
  const mockAuthTokenInstance = instance(mockAuthToken);

  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  it("starts with the Post Status and Clear buttons both disabled", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElements();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("enables the Post Status button and Clear button when the text field has text", async () => {
    const { postStatusButton, clearButton, statusField, user } =
      renderPostStatusAndGetElements();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();

    await user.type(statusField, "test status");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("disables the Post Status button and Clear button when the text field is cleared", async () => {
    const { postStatusButton, clearButton, statusField, user } =
      renderPostStatusAndGetElements();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();

    await user.type(statusField, "test status");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();

    user.clear(statusField);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("calls the presenter's submitPost method with correct parameters when the Post Status button is pressed", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const { postStatusButton,  statusField, user } =
      renderPostStatusAndGetElements(mockPresenterInstance);

    await user.type(statusField, "test status");

    await user.click(postStatusButton);
    verify(mockPresenter.submitPost(anything(), mockUserInstance, mockAuthTokenInstance)).once();
  });
});

const renderPostStatus = (presenter?: PostStatusPresenter) => {
  return render(<PostStatus presenter={presenter} />);
};

const renderPostStatusAndGetElements = (presenter?: PostStatusPresenter) => {
  const user = userEvent.setup();

  renderPostStatus(presenter);

  const postStatusButton = screen.getByLabelText("PostStatusButton");
  const clearButton = screen.getByLabelText("ClearButton");
  const statusField = screen.getByLabelText("StatusTextField");

  return { postStatusButton, clearButton, statusField, user };
};
