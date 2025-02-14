import useToastListener from "../toaster/ToastListenerHook";
import useUserInfo from "./UserInfoHook";
import {
  UserNavigationPresenter,
  UserNavigationView,
} from "../../presenters/UserNavigationPresenter";
import { useState } from "react";

interface UserNavigation {
  navigateToUser: (event: React.MouseEvent) => Promise<void>;
}

const useUserNavigation = (): UserNavigation => {
  const { displayErrorMessage } = useToastListener();
  const { setDisplayedUser, currentUser, authToken } = useUserInfo();

  const listener: UserNavigationView = {
    displayErrorMessage: displayErrorMessage,
    setDisplayedUser: setDisplayedUser,
    currentUser: currentUser,
    authToken: authToken,
  };

  const [presenter] = useState(new UserNavigationPresenter(listener));

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    presenter.navigateToUser(event);
  };

  return { navigateToUser };
};

export default useUserNavigation;
