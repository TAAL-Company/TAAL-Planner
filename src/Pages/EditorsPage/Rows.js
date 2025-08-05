const Rows = ({ editors, expandedRows }) => {
  const getRowsWithDetails = () => {
    const rows = [];
    editors.forEach((editor) => {
      rows.push({
        ...editor,
        id: editor.id || editor.userid,
      });
    });
    return rows;
  };

  return { getRowsWithDetails };
};

export default Rows;