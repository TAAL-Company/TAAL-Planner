import React, { useEffect, useState } from 'react';
import PlannerMap from './plannermap';
import View from './Components-planner/view';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { getingData_Places, getingData_Users, getingData_Tasks, getingData_Routes, getingDataStation } from '../api/api'
import PlacesDropdown from './Components-planner/PlacesDropdown';
import { DragDropContext } from 'react-beautiful-dnd'; // Add this import

export default function Plannerpage() {
    const [stations, setStations] = useState([]);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [packs, setPacks] = useState([]);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState(null);

    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedTaskfromstation, setSelectedTaskfromstation] = useState([]);

    const [selectedRoute, setSelectedRoute] = useState(null);

    const [selectedUserfromsite, setSelectedUserfromsite] = useState([]);
    const [selectedTaskfromsite, setSelectedTaskfromsite] = useState([]);
    const [selectedStationfromsite, setSelectedStationfromsite] = useState([]);
    const [selectedRoutefromsite, setSelectedRoutefromsite] = useState([]);
    const [selectedPackfromsite, setSelectedPackfromsite] = useState([]);

    const [routeViewData, setRouteViewData] = useState([]); // Add this state

    const pastelColors = [
        '#91D3A8', //
        '#F2B965', //
        '#F07F85', //
        '#9EA8EF', //
        '#DEBCF0', //
        '#F49AC2', //(pale pink)
        '#77DD77', //(pastel green)
        '#FFB347', //(pastel orange)
        '#B39EB5', //(lavender)
        '#FF6961', //(salmon)
        '#CB99C9', //(pastel purple)
        '#87CEFA', //(light blue)
        '#FDFD96', //(pastel yellow)
        '#F5A9A9', //(light coral)
        '#ADD8E6', //(light cyan)
        '#D9B611', //(pastel gold)
        '#A8D8EA', //(light sky blue)
        '#F4C2C2', //(light salmon)
        '#93A8A8', //(light gray-green)
        '#E8E3E3', //(light gray)

        '#F5A9E1', //(light pink)
        '#F5D0A9', //(light tan)
        '#F5A9BB', //
        '#A9F5A9', //(pastel green)
        '#F5A9F2', //(light lavender pink)
        '#F5E6CB', //(light yellow)
        '#F5D7CB', //(light apricot)
        '#F5CBDC', //(light lavender)
        '#C9F5CB', //(light green)
        '#CBF5E6', //(light blue-green)
        '#CBE6F5', //(light periwinkle)
        '#CBD7F5', //(light blue)
        '#C9CBF5', //(light purple)
        '#E6CBF5', //(light magenta)
    ];

    const handleSelectedSiteChange = (site) => {
        setSelectedSite(site);

        const siteUsersids = site.students.map((user) => user.id);
        const siteTasksids = site.tasks.map((task) => task.id);
        const siteStationsids = site.stations.map((station) => station.id);
        const siteRoutesids = site.routes.map((route) => route.id);
        const sitePacksids = site?.packs?.map((pack) => pack.id);

        const fullUserListformsite = users.filter((user) => siteUsersids.includes(user.id));
        setSelectedUserfromsite(fullUserListformsite);

        const fullTaskListfromsite = tasks.filter((task) => siteTasksids.includes(task.id));
        setSelectedTaskfromsite(fullTaskListfromsite);

        const fullStationListfromsite = stations
            .filter((station) => siteStationsids.includes(station.id))
            .map((station, idx) => ({
                ...station,
                color: pastelColors[idx % pastelColors.length] // assign color by index
            }));
        setSelectedStationfromsite(fullStationListfromsite);

        const fullRouteListfromsite = routes.filter((route) => siteRoutesids.includes(route.id));
        setSelectedRoutefromsite(fullRouteListfromsite);

        const fullPackListfromsite = packs?.filter((pack) => sitePacksids.includes(pack.id));
        setSelectedPackfromsite(fullPackListfromsite);

        setSelectedSite((prevSite) => ({
            ...prevSite,
            students: fullUserListformsite,
            tasks: fullTaskListfromsite,
            stations: fullStationListfromsite,
            routes: fullRouteListfromsite,
            packs: fullPackListfromsite,
        }));
    };

    const handleSelectedUserChange = (user) => {
        console.log("Selected user:", user);
        setSelectedUsers(user);
    };

    // Handler for clicking a station on the map
    const handleStationClick = (station) => {
        setSelectedStation(station);
        // Filter tasks for the selected station and assign the station's color
        if (station && station.tasks) {
            const stationTaskIds = station.tasks.map((task) => task.id);
            const filteredTasks = selectedTaskfromsite
                .filter((task) => stationTaskIds.includes(task.id))
                .map((task) => ({
                    ...task,
                    color: station.color // assign the station's color to the task
                }));
            setSelectedTaskfromstation(filteredTasks);
        }
    };
    const handleRouteClick = (route) => {
        setSelectedRoute(route);

        const routeTaskIds = route.tasks.map((task) => task.taskId);
        const filteredTasks = selectedSite.tasks.filter((task) => routeTaskIds.includes(task.id));
        const filteredStations = selectedSite.stations.filter((station) => station.tasks.some((task) => routeTaskIds.includes(task.id)));

        setSelectedStationfromsite(filteredStations);
        setSelectedTaskfromsite(filteredTasks);
        setSelectedTaskfromstation([]);
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        // Example: handle drag to routeView
        if (destination.droppableId === 'routeview') {
            if (source.droppableId === 'stations') {
                const station = selectedStationfromsite[source.index];
                if (!routeViewData.some(s => s.id === station.id)) {
                    setRouteViewData([...routeViewData, { ...station, tasks: station.tasks || [] }]);
                }
            }
            if (source.droppableId === 'tasks') {
                const task = selectedTaskfromstation[source.index];
                // Find station for this task
                const station = selectedStationfromsite.find(s => s.tasks?.some(t => t.id === task.id));
                if (station) {
                    let updated = [...routeViewData];
                    let stationIdx = updated.findIndex(s => s.id === station.id);
                    if (stationIdx === -1) {
                        updated.push({ ...station, tasks: [task] });
                    } else {
                        if (!updated[stationIdx].tasks.some(t => t.id === task.id)) {
                            updated[stationIdx].tasks.push(task);
                        }
                    }
                    setRouteViewData(updated);
                }
            }
            return;
        }

        // ...existing drag logic for other columns...
    };

    useEffect(() => {
        console.log("Selected Site:", selectedSite);
    }, [selectedSite]);

    // Fetching data from the API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const places = await getingData_Places();
                setPlaces(places);
            } catch (error) {
                console.log(error);
            }
            try {
                const users = await getingData_Users();
                setUsers(users);
            } catch (error) {
                console.log(error);
            }
            try {
                const tasks = await getingData_Tasks();
                setTasks(tasks);
            } catch (error) {
                console.log(error);
            }
            try {
                const routes = await getingData_Routes();
                setRoutes(routes);
            } catch (error) {
                console.log(error);
            }
            try {
                const stations = await getingDataStation();
                setStations(stations);
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            flexGrow: 1, p: 2,
            height: "90vh",
        }}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={9}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <PlacesDropdown
                                    allPlaces={places}
                                    currentLanguage={"he"}
                                    siteQuestionLanguage={"בחר אתר"}
                                    showDataTranslate={"original"}
                                    handleSelectedSiteChange={handleSelectedSiteChange}
                                    setSelectedSite={setSelectedSite}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <PlacesDropdown
                                    allPlaces={selectedUserfromsite}
                                    currentLanguage={"he"}
                                    siteQuestionLanguage={"users"}
                                    showDataTranslate={"original"}
                                    handleSelectedSiteChange={handleSelectedUserChange}
                                    setSelectedSite={setSelectedUsers}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <PlacesDropdown
                                    allPlaces={[]}
                                    currentLanguage={"he"}
                                    siteQuestionLanguage={"sheetes"}
                                    showDataTranslate={"original"}
                                    handleSelectedSiteChange={handleSelectedUserChange}
                                    setSelectedSite={setSelectedUsers}
                                />
                            </Grid>
                        </Grid>
                        <PlannerMap
                            stations={selectedStationfromsite}
                            setStations={setStations}
                            tasks={selectedTaskfromstation}
                            setTasks={setTasks}
                            route={selectedRoutefromsite}
                            setRoute={setRoutes}
                            Packs={selectedPackfromsite}
                            setPacks={setPacks}
                            onStationClick={handleStationClick}
                            onRouteClick={handleRouteClick}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <View routeViewData={routeViewData} />
                    </Grid>
                </Grid>
            </DragDropContext>
        </Box>
    );
}