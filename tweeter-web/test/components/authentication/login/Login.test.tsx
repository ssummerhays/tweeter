import React from "react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../../../src/components/authentication/login/Login";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { LoginPresenter } from "../../../../src/presenters/LoginPresenter";
import { anything, instance, mock, verify } from "@typestrong/ts-mockito";

library.add(fab);

describe("Login Component", () => {
  it("starts with the sign in button disabled", () => {
    const { signInButton } = renderLoginAndGetElements("/");
    expect(signInButton).toBeDisabled();
  });

  it("enables the sign in button when both the alias and password fields have text", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElements("/");

    await user.type(aliasField, "testUser");
    await user.type(passwordField, "password");

    expect(signInButton).toBeEnabled();
  });

  it("disables the sign in button when either field is cleared", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElements("/");

    await user.type(aliasField, "testUser");
    await user.type(passwordField, "password");
    expect(signInButton).toBeEnabled();

    user.clear(aliasField);
    expect(signInButton).toBeDisabled();

    await user.type(aliasField, "test");
    expect(signInButton).toBeEnabled();

    user.clear(passwordField);
    expect(signInButton).toBeDisabled();
  });

  it("calls the presenter's doLogin method with correct parameters when the sign-in button is pressed", async () => {
    const mockPresenter = mock<LoginPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const alias = "testUser";
    const password = "password";
    const rememberMe = false;
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElements("/", mockPresenterInstance);

    await user.type(aliasField, alias);
    await user.type(passwordField, password);
    expect(signInButton).toBeEnabled();

    await user.click(signInButton);

    verify(mockPresenter.doLogin(alias, password, rememberMe)).once();
  });
});

const renderLogin = (originalUrl: string, loginPresenter?: LoginPresenter) => {
  return render(
    <MemoryRouter>
      {!!loginPresenter ? (
        <Login originalUrl={originalUrl} presenter={loginPresenter} />
      ) : (
        <Login originalUrl={originalUrl} />
      )}
    </MemoryRouter>
  );
};

const renderLoginAndGetElements = (
  originalUrl: string,
  loginPresenter?: LoginPresenter
) => {
  const user = userEvent.setup();

  renderLogin(originalUrl, loginPresenter);

  const signInButton = screen.getByLabelText("AuthenticateButton");
  const aliasField = screen.getByLabelText("Alias");
  const passwordField = screen.getByLabelText("Password");

  return { signInButton, aliasField, passwordField, user };
};
