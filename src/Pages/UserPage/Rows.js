import React from 'react';
import { useTranslation } from 'react-i18next';

const Rows = ({ users, expandedRows }) => {
  const { t } = useTranslation();

  // Function to generate rows with routes
  const getRowsWithDetails = () => {
    const rows = [];
    users.forEach((user) => {
      user.role = user.role.replace('STUDENT', 'WORKER');
      rows.push(user); // Push the main user row
      if (expandedRows[user.id]) {
        // Add routes as additional rows for expanded user
        user.routes.forEach((route, index) => {
          rows.push({
            id: `${user.id}-${index}`, // Unique ID for the route row
            user_name: '',
            email: '',
            name: '',
            sites: [],
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            phone: '',
            role: '',
            cognitiveProfile: '',
            coach: '',
            picture_url: null,
            routeName: route.name,
            routeOnlyOnce: route.OnlyOnce ? t('Yes') : t('No'),
            isRoute: true, // Mark this row as a route row
            menu: null, // Include placeholder for menu
            expand: null, // Include placeholder for expand
            active: null, // Placeholder for active
          });
        });
      }
    });
    return rows;
  };

  return { getRowsWithDetails };
};

export default Rows;