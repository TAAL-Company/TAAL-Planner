// import React from 'react';
// import {
//   GridToolbarColumnsButton,
//   GridToolbarFilterButton,
//   GridToolbarDensitySelector,
//   GridToolbarExport,
// } from '@mui/x-data-grid';
// import { useTranslation } from 'react-i18next';

// const ToolbarButtons = ({ tableType }) => {
//   const { t } = useTranslation();

//   let filePrefix;
//   switch (tableType) {
//     case 'Flags':
//       filePrefix = t('FormsPage.flagsTitle');
//       break;
//     case 'TaskPerformance':
//       filePrefix = t('FormsPage.taskPerformanceTitle');
//       break;
//     case 'TaskAbility':
//       filePrefix = t('FormsPage.taskabilityTitle');
//       break;
//     default:
//       filePrefix = t('FormsPage.generalPerformanceTitle');
//   }

//   const fileName = `${filePrefix}_${new Date()
//     .toLocaleDateString('en-GB')
//     .replace(/\//g, '-')}.csv`;

//   return (
//     <div>
//       <GridToolbarColumnsButton style={{ color: 'black' }} />
//       <GridToolbarFilterButton style={{ color: 'black' }} />
//       <GridToolbarDensitySelector style={{ color: 'black' }} />
//       <GridToolbarExport
//         csvOptions={{ fileName }}
//         style={{ color: 'black' }}
//       />
//     </div>
//   );
// };

// export default ToolbarButtons;