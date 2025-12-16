import React from 'react';
import {
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { getTranslation } from '../i18n';

const ToolbarButtons = ({ language, tableType }) => {
  const t = (key) => getTranslation(key, language);

  let filePrefix;
  switch (tableType) {
    case 'Flags':
      filePrefix = t('flagsTitle');
      break;
    case 'TaskPerformance':
      filePrefix = t('taskPerformanceTitle');
      break;
    case 'TaskAbility':
      filePrefix = t('taskabilityTitle');
      break;
    default:
      filePrefix = t('generalPerformanceTitle');
  }

  const fileName = `${filePrefix}_${new Date()
    .toLocaleDateString('en-GB')
    .replace(/\//g, '-')}.csv`;

  return (
    <div>
      <GridToolbarColumnsButton style={{ color: 'black' }} />
      <GridToolbarFilterButton style={{ color: 'black' }} />
      <GridToolbarDensitySelector style={{ color: 'black' }} />
      <GridToolbarExport
        csvOptions={{ fileName }}
        style={{ color: 'black' }}
      />
    </div>
  );
};

export default ToolbarButtons;