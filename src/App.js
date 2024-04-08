import { BrowserRouter } from 'react-router-dom';
import Nav from './components/Nav/Nav';
import Planner from './components/Planner/Planner';
import Calculator from './components/Calculator/Calculator';
import Student from './components/Student/Student';
// import Student from '/components/Student/Student';
import './App.css';
import Login from './components/Login/Login';
import { Provider } from 'react-redux';
import store from './redux/store';
import Dashboard from './components/Dashboard/Dashboard';
import Gallery from './components/Gallery/Gallery';
import Cards from './components/Cards/Cards';
import { Switch, Route } from 'react-router-loading';
import PlacesCards from './components/placesCards/placesCards';
import Forms from './components/Form/Forms';
import Coaches from './components/Coaches/Coaches';
import Community from './components/Community/community';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import * as reactRouterDom from "react-router-dom";

SuperTokens.init({
  appInfo: {
    // learn more about this on https://supertokens.com/docs/emailpassword/appinfo
    appName: "TAAL",
    apiDomain: "http://localhost:3000",
    websiteDomain: "http://localhost:3001",
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  getRedirectionURL: async (context) => {
    console.log('context', context.action);
    if (context.action === "TO_AUTH") {
      return "/auth"; // return the path where you are rendering the Auth UI
    } else if (context.action === "SUCCESS" && context.newSessionCreated) {
      return "/planner"; // defaults to "/"
    };
  },
  recipeList: [
    EmailPassword.init({
      style: `
              [data-supertokens~=container] {
                  --palette-background: 51, 51, 51;
                  --palette-inputBackground: 41, 41, 41;
                  --palette-inputBorder: 41, 41, 41;
                  --palette-textTitle: 255, 255, 255;
                  --palette-textLabel: 255, 255, 255;
                  --palette-textPrimary: 255, 255, 255;
                  --palette-error: 173, 46, 46;
                  --palette-textInput: 169, 169, 169;
                  --palette-textLink: 169, 169, 169;
                  --palette-superTokensBrandingBackground: 51, 51, 51;
                  --palette-superTokensBrandingText: 51, 51, 51;
              }
          `
    }),
    Session.init()
  ]
});

// import CallState from "./components/CallState/CallState";
function App() {
  return (
    <>
      <SuperTokensWrapper>
        <div>
          <DndProvider backend={HTML5Backend}>
            <Provider store={store}>
              <BrowserRouter>
                {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [EmailPasswordPreBuiltUI])}
                <Route path='/' exact><SessionAuth><Nav /><Planner /></SessionAuth></Route>
                <Route path='/planner' ><SessionAuth><Nav /><Planner /></SessionAuth></Route>
                <Route path='/student' ><SessionAuth><Nav /><Student /></SessionAuth></Route>
                <Route path='/Calculator' ><SessionAuth><Nav /><Calculator /></SessionAuth></Route>
                <Route path='/routes_cards' ><SessionAuth><Nav /><Cards /></SessionAuth></Route>
                <Route path='/Dashboard' ><SessionAuth><Nav /><Dashboard /></SessionAuth></Route>
                <Route path='/Gallery' ><SessionAuth><Nav /><Gallery /></SessionAuth></Route>
                <Route path='/places' ><SessionAuth><Nav /><PlacesCards /></SessionAuth></Route>
                <Route path='/Forms' ><SessionAuth><Nav /><Forms /></SessionAuth></Route>
                <Route path='/coaches' ><SessionAuth><Nav /><Coaches /></SessionAuth></Route>
                <Route path='/community' ><SessionAuth><Nav /><Community /></SessionAuth></Route>
              </BrowserRouter>
            </Provider>
          </DndProvider>
        </div>
      </SuperTokensWrapper>
    </>
  );
}
const Home = () => <Login />;
export default App;
