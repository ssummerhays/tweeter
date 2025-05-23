import "./UserInfo.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthToken, User } from "tweeter-shared";
import useToastListener from "../toaster/ToastListenerHook";
import useUserInfo from "./UserInfoHook";
import { UserInfoPresenter } from "../../presenters/UserInfoPresenter";
import { MessageView } from "../../presenters/Presenter";

const UserInfo = () => {
  const [countChanged, setCountChanged] = useState(true);
  const [isFollower, setIsFollower] = useState(false);
  const { displayErrorMessage, displayInfoMessage, clearLastInfoMessage } =
    useToastListener();

  const { currentUser, authToken, displayedUser, setDisplayedUser } =
    useUserInfo();

  if (!displayedUser) {
    setDisplayedUser(currentUser!);
  }

  useEffect(() => {
    setIsFollowerStatus(authToken!, currentUser!, displayedUser!);
    setNumbFollowees(authToken!, displayedUser!);
    setNumbFollowers(authToken!, displayedUser!);
  }, [displayedUser]);

  useEffect(() => {
    if (countChanged) {
      setCountChanged(false);
    }
  }, [countChanged]);

  const listener: MessageView = {
    displayErrorMessage: displayErrorMessage,
    displayInfoMessage: displayInfoMessage,
    clearLastInfoMessage: clearLastInfoMessage,
  };

  const [presenter] = useState(new UserInfoPresenter(listener));

  const setIsFollowerStatus = async (
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) => {
    await presenter.setIsFollowerStatus(authToken, currentUser, displayedUser);
    setDisplayFollowerStatus();
  };

  const setDisplayFollowerStatus = () => {
    setIsFollower(presenter.isFollower);
  };

  const setNumbFollowees = async (
    authToken: AuthToken,
    displayedUser: User
  ) => {
    await presenter.setNumbFollowees(authToken, displayedUser);
    setCountChanged(true);
  };

  const setNumbFollowers = async (
    authToken: AuthToken,
    displayedUser: User
  ) => {
    await presenter.setNumbFollowers(authToken, displayedUser);
    setCountChanged(true);
  };

  const switchToLoggedInUser = (event: React.MouseEvent): void => {
    event.preventDefault();
    setDisplayedUser(currentUser!);
  };

  const followDisplayedUser = async (
    event: React.MouseEvent
  ): Promise<void> => {
    await presenter.followDisplayedUser(event, displayedUser!, authToken!);
    setIsFollower(true);
  };

  const unfollowDisplayedUser = async (
    event: React.MouseEvent
  ): Promise<void> => {
    await presenter.unfollowDisplayedUser(event, displayedUser!, authToken!);
    setIsFollower(false);
  };

  return (
    <div className={presenter.isLoading ? "loading" : ""}>
      {currentUser === null || displayedUser === null || authToken === null ? (
        <></>
      ) : (
        <div className="container">
          <div className="row">
            <div className="col-auto p-3">
              <img
                src={displayedUser.imageUrl}
                className="img-fluid"
                width="100"
                alt="Posting user"
              />
            </div>
            <div className="col p-3">
              {displayedUser !== currentUser && (
                <p id="returnToLoggedInUser">
                  Return to{" "}
                  <Link
                    to={""}
                    onClick={(event) => switchToLoggedInUser(event)}
                  >
                    logged in user
                  </Link>
                </p>
              )}
              <h2>
                <b>{displayedUser.name}</b>
              </h2>
              <h3>{displayedUser.alias}</h3>
              <br />
              {presenter.followeeCount > -1 && presenter.followerCount > -1 && (
                <div>
                  Followees: {presenter.followeeCount} Followers:{" "}
                  {presenter.followerCount}
                </div>
              )}
            </div>
            <form>
              {displayedUser !== currentUser && (
                <div className="form-group">
                  {isFollower ? (
                    <button
                      id="unFollowButton"
                      className="btn btn-md btn-secondary me-1"
                      type="submit"
                      style={{ width: "6em" }}
                      onClick={(event) => unfollowDisplayedUser(event)}
                    >
                      {presenter.isLoading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <div>Unfollow</div>
                      )}
                    </button>
                  ) : (
                    <button
                      id="followButton"
                      className="btn btn-md btn-primary me-1"
                      type="submit"
                      style={{ width: "6em" }}
                      onClick={(event) => followDisplayedUser(event)}
                    >
                      {presenter.isLoading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <div>Follow</div>
                      )}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
