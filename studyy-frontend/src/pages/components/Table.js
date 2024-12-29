import React from 'react';

function Table({ columns, data, actions, onPaginate, currentPage, totalPages }) {
  return (
    <div>
      <table className="table table-default table-hover table-responsive table-striped-columns table-borderless mt-2 ms-4">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                {Object.values(row).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
                <td>
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      className="btn table-button mx-1"
                      onClick={() => action.onClick(row.id)}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={columns.length + 1}>No data available</td></tr>
          )}
        </tbody>
      </table>

      <nav>
        <ul className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
              <a className="page-link" onClick={() => onPaginate(i + 1)}>
                {i + 1}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Table;
