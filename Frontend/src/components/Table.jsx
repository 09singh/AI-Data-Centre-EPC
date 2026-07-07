export default function Table({ columns, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <td
              key={col}
              style={{ padding: '8px 4px', color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}
            >
              {col}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '10px 4px', borderBottom: '1px solid var(--border)' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
