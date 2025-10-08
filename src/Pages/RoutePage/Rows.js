const Rows = ({ routes }) => {
  const getRowsWithDetails = () => {
    return routes.map((route) => ({
      id: route.id,
      name: route.name,
      sites: route.sites,
      createdAt: route.createdAt,
      picture_url: route.picture_url,
      OnlyOnce: route.OnlyOnce,
      multi_language_description: route.multi_language_description,
      parentRouteId: route.parentRouteId,
      tasks: route.tasks,
      students: route.students,
    }));
  };
  return { getRowsWithDetails };
};

export default Rows;