import React, { useState } from "react";
import LoginAPI from "./LoginAPI";
import logo from "../../Pictures/loginLogoTaal.svg";
import userLogo from "../../Pictures/user-logo.png";
import lockLogo from "../../Pictures/lock-logo.png";
import "./styleLogin.css";
import background from "../../Pictures/backgroundLogin.png";

let flagLoading = false;

function Login(props) {
  const [, setFlagLoading] = useState(false);
  const [APIDetailsLogin, setAPIDetailsLogin] = useState({
    user: "",
    pass: "",
  });
  const [loginDetails, setLoginDetails] = useState({
    user: "",
    pass: "",
  });
  function handleChange(e) {
    const { name, value } = e.target;
    setLoginDetails((prev) => {
      return { ...prev, [name]: value };
    });
  }
  function handleSubmit() {
    setAPIDetailsLogin({ ...loginDetails });
    setFlagLoading((flagLoading = true));
  }

  return (
    <>
      {sessionStorage.logged_in ? (
        <h1>
          You are not supposed to be here ! Please close the tab and log in
          again
        </h1>
      ) : (
        <>
          <div className="App-header">
            <div className="box">
              <div className="logoHeader">
                <img src={logo} className="App-logo" alt="logo"></img>
              </div>
              {/* <p>{props.serverMessage}</p> */}
              <div
                className="d-flex justify-content-around"
                onKeyPress={(e) => {
                  e.key === "Enter" && handleSubmit();
                }}
              >
                <div className="d-flex flex-column">
                  {/* <div className="p-2">
                    <h2
                      className="Login_Title"
                      style={{ paddingTop: "7vh", marginLeft: "0.5rem" }}
                    >
                      Login
                    </h2>
                  </div> */}
                  <div className="p-2">
                    <div className="login">
                      <div className="input-container">
                        <input
                          className="inputLogin"
                          type="text"
                          placeholder="שם משתמש"
                          name="user"
                          value={loginDetails.user}
                          onChange={handleChange}
                        />
                        <div className="img-container">
                          <img
                            src={userLogo}
                            className="user-logo"
                            alt="logo"
                          ></img>
                        </div>
                      </div>
                      <div className="input-container">
                        <input
                          className="inputLogin"
                          type="password"
                          placeholder="סיסמא"
                          name="pass"
                          value={loginDetails.pass}
                          onChange={handleChange}
                        />
                        <div className="img-container">
                          <img
                            src={lockLogo}
                            className="lock-logo"
                            alt="logo"
                          ></img>
                        </div>
                      </div>
                      <div className="d-flex justify-content-center">
                        <input
                          type="submit"
                          onClick={handleSubmit}
                          value="התחברות"
                        />
                      </div>
                      <div className="forgetPassword">שכחת סיסמא?</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <LoginAPI
            APIDetailsLogin={APIDetailsLogin}
            setUsername={props.setUsername}
            setIsLoggedIn={props.setIsLoggedIn}
            setServerMessage={props.setServerMessage}
            getFlagLoading={flagLoading}
          />
        </>
      )}
    </>
  );
}
export default Login;
