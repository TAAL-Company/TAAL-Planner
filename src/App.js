import { BrowserRouter as Router } from 'react-router-dom';
import Nav from './components/Nav/Nav';
import Planner from './Pages/PlannerPage/Planner/Planner';
import Calculator from './components/junk/Calculator/Calculator';
import UsersTable from './Pages/UserPage/UsersTable';
// import Student from '/components/Student/Student';
import './App.css';
import Login from './Pages/LoginPage/Login';
import { Provider } from 'react-redux';
import store from './redux/store';
import Dashboard from './Pages/DashboardPage/Dashboard';
import GalleryPage from './Pages/GalleryPage/Gallery/Gallerypage/gallery-page';
// import Cards from './components/Cards/Cards';
import RouteTable from './Pages/RoutePage/RouteTable';
import { Switch, Route } from 'react-router-loading';
// import PlacesCards from './components/placesCards/placesCards';
import Sites from './Pages/SitePage/SitesTable';


import Forms from './Pages/FormPage/Form/Forms';
// import Coaches from './components/Coaches/Coaches';
import Coaches from './Pages/CoachePage/CoachesTable';

// import Editors from './components/Editor/Editors';
import Editors from './Pages/EditorsPage/EditorTable';
import Community from './Pages/CommunityPage/community';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './i18n'; // Import the i18n configuration

import Plannerpage from './planner/plannerpage';

import { NotificationProvider } from "./components/Notification/NotificationProvider";
import { TranslationProvider } from './Utility/TranslationProvider';

console.warn("TAAL DEV INFO", {
  "Version": process.env.REACT_APP_VERSION,
  "Base URL": process.env.REACT_APP_BASE_URL,
  "Node Environment": process.env.NODE_ENV,
  "Storage Resource Name": process.env.REACT_APP_STORAGE_CONTAINER_NAME
});

// import CallState from "./components/CallState/CallState";
function App() {
  return (
    <>
      <div>
        <TranslationProvider>
          <NotificationProvider>
            <DndProvider backend={HTML5Backend}>
              <Provider store={store}>
                <Router>
                  <div>
                    {sessionStorage.logged_in == 1 ? (
                      <>
                        <Nav />
                      </>
                    ) : null}
                    <Switch>
                      <Route path='/' exact component={Home}></Route>
                      <Route path='/planner' component={Planner}></Route>
                      <Route path='/Users' component={UsersTable}></Route>
                      <Route path='/Calculator' component={Calculator}></Route>
                      <Route path='/routes_cards' component={RouteTable}></Route>
                      <Route path='/Dashboard' component={Dashboard}></Route>
                      <Route path='/Gallery' component={GalleryPage}></Route>
                      <Route path='/places' component={Sites}></Route>
                      <Route path='/Forms' component={Forms}></Route>
                      <Route path='/coaches' component={Coaches}></Route>
                      <Route path='/community' component={Community}></Route>
                      <Route path='/editor' component={Editors}></Route>
                      <Route path='/dev' component={Plannerpage}></Route>
                      <Route path='/subjects' component={Community}></Route>
                    </Switch>
                  </div>
                </Router>
              </Provider>
            </DndProvider>
          </NotificationProvider>
        </TranslationProvider>
      </div>
    </>
  );
}
const Home = () => <Login />;
export default App;
