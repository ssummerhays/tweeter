interface Props {
    onKeyDownFunction: (event: React.KeyboardEvent<HTMLElement>) => void;
    setAlias: (alias: string) => void;
    setPassword: (password: string) => void;
}

const AuthenticationFields = (props: Props) => {
  return (
    <>
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          size={50}
          aria-label="Alias"
          id="aliasInput"
          placeholder="name@example.com"
          onKeyDown={props.onKeyDownFunction}
          onChange={(event) => props.setAlias(event.target.value)}
        />
        <label htmlFor="aliasInput">Alias</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control bottom"
          aria-label="Password"
          id="passwordInput"
          placeholder="Password"
          onKeyDown={props.onKeyDownFunction}
          onChange={(event) => props.setPassword(event.target.value)}
        />
        <label htmlFor="passwordInput">Password</label>
      </div>
    </>
  );
};

export default AuthenticationFields;
