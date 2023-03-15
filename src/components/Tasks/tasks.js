const Tasks = (props) => {
  const [tasksOfStation, setTasksOfStation] = useState([]);

  useEffect(() => {
    setTasksOfStation(props.myStation.data);
  }, [props.myStation]);
};
export default Stations;
