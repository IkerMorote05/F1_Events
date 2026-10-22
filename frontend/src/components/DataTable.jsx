import React from 'react';

export const DataTable = ({ columns, rows, rowKey, emptyMessage }) => (
  <div className="piloto-table-container data-table-container">
    <table className="f1-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="piloto-table-empty">{emptyMessage}</td>
          </tr>
        ) : rows.map((row, index) => (
          <tr key={rowKey(row, index)}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
