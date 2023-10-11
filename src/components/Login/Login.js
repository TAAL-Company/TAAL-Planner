import React, { useState } from "react";
import LoginAPI from "./LoginAPI";
import logo from "../../Pictures/loginLogoTaal.svg";
import userLogo from "../../Pictures/user-logo.png";
import lockLogo from "../../Pictures/lock-logo.png";
import "./styleLogin.css";
import background from "../../Pictures/backgroundLogin.png";
import { getingDataTasks, getingData_Tasks, postTask_Performance } from '../../api/api';
import taskAbility from '../../components/Form/taskAbility.json'

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

  async function getall() {
    // let Task_Performance = [
    //   {
    //     taskId: "string",
    //     studentId: "string",
    //     routeId: "string",
    //     siteId: "string",
    //     startTime: "2023-10-11T09:21:20.393Z",
    //     endTime: "2023-10-11T09:21:20.393Z",
    //     whenAssisted: "2023-10-11T09:21:20.393Z"
    //   }
    // ]
    // Task_Performance.map(async (TaskPerformance) => {
    //   const tasks = await postTask_Performance(
    //     TaskPerformance.taskId,
    //     TaskPerformance.studentId,
    //     TaskPerformance.routeId,
    //     TaskPerformance.siteId,
    //     TaskPerformance.startTime,
    //     TaskPerformance.endTime,
    //     TaskPerformance.whenAssisted);
    //     console.log("Task Performance",tasks);
    // })



    // const tasks = await getingData_Tasks();

    // var props = ['id', 'title'];

    // var tasksWithAMatchingName = tasks.filter(function (task) {
    //   return taskAbility.some(function (taskA) {
    //     return task.title === taskA.task;
    //   });
    // }).map(function (o) {
    //   return props.reduce(function (newo, name) {
    //     newo[name] = o[name];
    //     return newo;
    //   }, {});
    // });

    // var tasksWithOutAMatchingName = tasks.filter(function (task) {
    //    return !taskAbility.some(function (taskA) {
    //     return task.title === taskA.task;
    //   });
    // }).map(function (o) {
    //   return props.reduce(function (newo, name) {
    //     newo[name] = o[name];
    //     return newo;
    //   }, {});
    // });

    // console.log("tasks With A Matching Name ",tasksWithAMatchingName);
    // console.log("tasks Without A Matching Name ",tasksWithOutAMatchingName);


    //const IdToDelete = await getingDataRoutes();

    //let IdToDelete = []

    //console.log(IdToDelete);

    //IdToDelete.map(async (user) => {
    // console.log(user.id);
    // let response = await deleteSites(user.id)
    // console.log("done - " + response);
    //})

    // IdToDelete.map(async (id) => {
    //   console.log(id.id);
    //   //let response = await deleteSites(id.id)
    //   //console.log(response);
    //   console.log("done");
    // })
    //   const usersData = await getingData_Users();
    //   // console.log(usersData);
    //   let usersDatawithTW = usersData.filter(item => item.email.includes('taalworker+') && item.cognitiveProfile != null);
    //   console.log("usersDatawithTW : " + JSON.stringify(usersDatawithTW));

    //   usersDatawithTW.map(async (user) => {
    //     const number = user.email.split('+').pop().split('@')[0];
    //     user.user_name = "TW" + number
    //     console.log("user " + JSON.stringify(user));
    //     //await updateUser(user.id,user)
    //   })

    //   var count = Object.keys(usersDatawithTW).length;
    //   console.log(count);
  }

  getall()

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
