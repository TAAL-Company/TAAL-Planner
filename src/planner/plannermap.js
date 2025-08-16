import React, { useState } from 'react';
import { Plannerbox } from './Components-planner/Plannerbox';
import { Frame } from './Components-planner/tag';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import BorderedTreeView from '../Pages/PlannerPage/Places/BorderedTreeView';

export default function PlannerMap({ stations, setStations, tasks, setTasks, route, setRoute, Packs, setPacks, onStationClick, onRouteClick , onTaskClick , onPackClick }) {
  return (
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={3} sm={3} md={3}>
            <Plannerbox
              droppableId="Packs"
              data={Packs}
              renderItem={(item) => (
                <div onClick={() => onPackClick && onPackClick(item)}>
                  <Frame id={item.id} text={item.name} color={item.color} />
                </div>
              )}
              color="#ba11b0"
              title="אריזות"
              icontext="לאחר בחירת התחנות והמשימות, בעמודה זו יופיעו האריזות שנוצרו."
              direction="rtl"
            />
          </Grid>
          <Grid item xs={3} sm={3} md={3}>
            <Plannerbox
              droppableId="route"
              data={route} // prevent duplication!
              renderItem={() => null} // prevent default rendering
              customDroppableContent={
                <BorderedTreeView
                  direction="rtl"
                  filteredDataRoutes={route}
                  renderRoute={(route, index) => (
                    <div onClick={() => onRouteClick?.(route)}>
                      <Frame id={route.id} text={route.name} color={route.color} />
                    </div>
                  )}
                />
              }
              color="#256FA1"
              title="המסלול"
              icontext="אין פריטים בתצוגת המסלול."
              direction="rtl"
            />
          </Grid>
          <Grid item xs={3} sm={3} md={3}>
            <Plannerbox
              droppableId="stations"
              data={stations}
              renderItem={(item) => (
                <div onClick={() => onStationClick && onStationClick(item)}>
                  <Frame id={item.id} text={item.title} color={item.color} />
                </div>
              )}
              color="#cc0127"
              title="תחנות"
              icontext="אחרי בחירת המסלול, בעמודה זו יופיעו התחנות הקיימות בו."
              direction="rtl"
            />
          </Grid>
          <Grid item xs={3} sm={3} md={3}>
            <Plannerbox
              droppableId="tasks"
              data={tasks}
              renderItem={(item) => (
                <div onClick={() => onTaskClick && onTaskClick(item)}>
                  <Frame id={item.id} text={item.title} color={item.color} />
                </div>
              )}
              color="#e8b221"
              title="משימות"
              icontext="אחרי בחירת התחנה, בעמודה זו יופיעו המשימות הקיימות בה."
              direction="rtl"
            />
          </Grid>

        </Grid>
      </Box>
  );
}
