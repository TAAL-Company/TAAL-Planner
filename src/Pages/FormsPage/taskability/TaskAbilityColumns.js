import React from 'react';
import { getTranslation } from '../i18n';

const TaskAbilityColumns = ({ language, cognitiveAbilities }) => {
  const t = (key) => getTranslation(key, language);

  const baseColumns = [
    {
      field: 'id',
      headerName: t('id'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div style={{ textAlign: 'right', fontSize: '1rem' }}>
          {params.row.id + 1}
        </div>
      ),
    },
    {
      field: 'taskTaskabilityHE',
      headerName: t('task'),
      width: 180,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'routeTaskabilityHE',
      headerName: t('route'),
      width: 180,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
  ];

  // Add dynamic columns for cognitive abilities
  const dynamicColumns = cognitiveAbilities
    .filter((cognitive) => cognitive.ML)
    .map((cognitive, index) => ({
      field: index.toString(),
      headerName: cognitive.trait,
      width: 200,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      category: cognitive.category,
    }));

  const columns = [...baseColumns, ...dynamicColumns];

  return { columns };
};

export default TaskAbilityColumns;
