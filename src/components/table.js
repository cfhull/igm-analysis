import React, { useState } from 'react'
import classNames from 'classNames'
import './table.css'
import { TransitionGroup } from 'react-transition-group'
import { ExpandTransition } from './transitions.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'

const Table = ({ headers, rows, rowClickHandler }) => {
  const [sort, setSort] = useState({ key: null, asc: false })

  const sortedRows = sort.key
    ? rows.sort((a, b) => {
        let val1 = a.values.find(x => x.key === sort.key)
        let val2 = b.values.find(x => x.key === sort.key)

        if (val1.value === null && val2.value === null) null
        else if (val2.value === null) return -1

        val1 = val1.value || val1.label
        val2 = val2.value || val2.label

        const result = val1 < val2 ? -1 : val1 > val2 ? 1 : 0

        return sort.asc ? result : -result
      })
    : rows

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {headers.map(header => (
              <th
                key={header}
                className={rows[0].values.find(x => x.key === header).className}
                onClick={() => setSort({ key: header, asc: !sort.asc })}
              >
                {header}
                {sort.key === header ? (
                  sort.asc ? (
                    <FontAwesomeIcon icon={faSortUp} />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} />
                  )
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map(row => (
            <tr
              key={row.id}
              className={classNames({ selectable: rowClickHandler })}
              onClick={rowClickHandler ? () => rowClickHandler(row.id) : null}
            >
              {headers.map(header => (
                <td
                  key={header}
                  className={row.values.find(x => x.key === header).className}
                >
                  {row.values.find(x => x.key === header).label}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
