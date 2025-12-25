import React from 'react';
import { useTranslation } from 'react-i18next';

const TaskAbilityColumns = ({ cognitiveAbilities }) => {
  const { t } = useTranslation();

  const baseColumns = [
    {
      field: 'id',
      headerName: t('FormsPage.id'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div style={{ textAlign: 'center', fontSize: '1rem' }}>
          {params.row.id + 1}
        </div>
      ),
    },
    {
      field: 'taskTaskabilityHE',
      headerName: t('FormsPage.task'),
      width: 180,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'routeTaskabilityHE',
      headerName: t('FormsPage.route'),
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
