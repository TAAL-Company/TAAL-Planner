import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  AvatarGroup,
  Tooltip,
  Collapse,
  Divider,
} from '@mui/material';

function ShiftBlock({ shift, users, routes, isSelected, onClick }) {
  const assignedUsers = (shift.assignments || []).map((a) => ({
    ...a,
    user: users.find((u) => u.id === a.userId),
  }));

  // Collect unique ordered route IDs across all assignments (for the route list)
  const uniqueRouteIds = [];
  const seen = new Set();
  (shift.assignments || []).forEach((a) => {
    (a.routeIds || []).forEach((rid) => {
      if (!seen.has(rid)) { seen.add(rid); uniqueRouteIds.push(rid); }
    });
  });
  const orderedRoutes = uniqueRouteIds.map((rid) => routes.find((r) => r.id === rid)).filter(Boolean);

  return (
    <Box
      onClick={(e) => { e.stopPropagation(); onClick(shift); }}
      sx={{
        backgroundColor: shift.color || '#1976d2',
        borderRadius: 1,
        p: '5px 7px',
        mb: 0.5,
        cursor: 'pointer',
        color: 'white',
        transition: 'all 0.18s',
        '&:hover': { opacity: 0.88, transform: 'translateY(-1px)' },
        outline: isSelected ? '2.5px solid white' : 'none',
        boxShadow: isSelected
          ? `0 0 0 3px ${shift.color || '#1976d2'}, 0 4px 12px rgba(0,0,0,0.3)`
          : '0 1px 4px rgba(0,0,0,0.15)',
      }}
    >
      {/* Shift name */}
      <Typography
        variant="caption"
        fontWeight={700}
        noWrap
        sx={{ fontSize: 11, lineHeight: 1.3, display: 'block' }}
      >
        {shift.name}
      </Typography>

      {/* Time range */}
      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: 10, display: 'block' }}>
        {shift.startTime}–{shift.endTime}
      </Typography>

      {/* Route list */}
      {orderedRoutes.length > 0 && (
        <Box sx={{ mt: 0.3, pt: 0.3, borderTop: '1px solid rgba(255,255,255,0.25)' }}>
          {orderedRoutes.map((route, idx) => (
            <Box key={route.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ fontSize: 9, opacity: 0.65, fontWeight: 700, minWidth: 11, lineHeight: 1.6 }}
              >
                {idx + 1}.
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ fontSize: 9.5, opacity: 0.95, flex: 1, lineHeight: 1.6 }}
              >
                {route.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Avatar group */}
      {assignedUsers.length > 0 && (
        <AvatarGroup
          max={3}
          sx={{
            mt: 0.5,
            justifyContent: 'flex-start',
            '& .MuiAvatar-root': { width: 17, height: 17, fontSize: 8, border: '1px solid white', ml: '-3px' },
          }}
        >
          {assignedUsers.map((a) => (
            <Tooltip key={a.userId} title={a.user?.name || a.userName || ''}>
              <Avatar src={a.user?.picture_url || a.pictureUrl} sx={{ width: 17, height: 17 }} />
            </Tooltip>
          ))}
        </AvatarGroup>
      )}

      {/*──── Inline Timeline (only when shift is selected) ────*/}
      <Collapse in={isSelected && assignedUsers.length > 0} timeout={200}>
        <Divider sx={{ my: 0.6, borderColor: 'rgba(255,255,255,0.35)' }} />
        <Typography
          variant="caption"
          sx={{
            fontSize: 9,
            opacity: 0.75,
            fontWeight: 700,
            letterSpacing: 0.7,
            textTransform: 'uppercase',
            display: 'block',
            mb: 0.5,
          }}
        >
          Timeline
        </Typography>

        {assignedUsers.map(({ userId, userName, user, routeIds }) => (
          <Box key={userId} sx={{ mb: 0.75 }}>
            {/* User row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
              <Avatar
                src={user?.picture_url}
                sx={{ width: 14, height: 14, fontSize: 7, border: '1px solid rgba(255,255,255,0.5)' }}
              />
              <Typography
                variant="caption"
                noWrap
                sx={{ fontSize: 9.5, fontWeight: 700, lineHeight: 1.4 }}
              >
                {user?.name || userName}
              </Typography>
            </Box>

            {/* Routes for this user */}
            {(routeIds || []).map((rid, i) => {
              const route = routes.find((r) => r.id === rid);
              return (
                <Box
                  key={rid}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1.5, mb: 0.2 }}
                >
                  <Box
                    sx={{
                      width: 13,
                      height: 13,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: 7, fontWeight: 700, lineHeight: 1, color: 'white' }}>
                      {i + 1}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ fontSize: 8.5, opacity: 0.9, flex: 1 }}
                  >
                    {route?.name || rid}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Collapse>
    </Box>
  );
}

export default ShiftBlock;
