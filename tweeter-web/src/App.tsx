import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import useUserInfo from "./components/userInfo/UserInfoHook";
import { FolloweePresenter } from "./presenters/FolloweePresenter";
import { FollowerPresenter } from "./presenters/FollowerPresenter";
import { StoryPresenter } from "./presenters/StoryPresenter";
import { FeedPresenter } from "./presenters/FeedPresenter";
import ItemScroller from "./components/mainLayout/ItemScroller";
import { PagedItemView } from "./presenters/PagedItemPresenter";
import { Status, User } from "tweeter-shared";
import { StatusService } from "./model/service/StatusService";
import StatusItem from "./components/statusItem/StatusItem";
import { FollowService } from "./model/service/FollowService";
import UserItem from "./components/userItem/UserItem";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/feed" />} />
        <Route
          path="feed"
          element={
            <ItemScroller<Status, StatusService>
              key={"feed"}
              presenterGenerator={(view: PagedItemView<Status>) =>
                new FeedPresenter(view)
              }
              itemComponentGenerator={(item: Status) => (
                <StatusItem item={item} />
              )}
            />
          }
        />
        <Route
          path="story"
          element={
            <ItemScroller<Status, StatusService>
              key={"story"}
              presenterGenerator={(view: PagedItemView<Status>) =>
                new StoryPresenter(view)
              }
              itemComponentGenerator={(item: Status) => (
                <StatusItem item={item} />
              )}
            />
          }
        />
        <Route
          path="followees"
          element={
            <ItemScroller<User, FollowService>
              key={"followees"}
              presenterGenerator={(view: PagedItemView<User>) =>
                new FolloweePresenter(view)
              }
              itemComponentGenerator={(item: User) => <UserItem value={item} />}
            />
          }
        />
        <Route
          path="followers"
          element={
            <ItemScroller<User, FollowService>
              key={"followers"}
              presenterGenerator={(view: PagedItemView<User>) =>
                new FollowerPresenter(view)
              }
              itemComponentGenerator={(item: User) => <UserItem value={item} />}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/feed" />} />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
