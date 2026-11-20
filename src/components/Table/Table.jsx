import { memo, useRef, useState } from 'react'
import './Table.css'
import Menu from '../Menu/Menu'
import { IconKey } from '@tabler/icons-react'


function Table({ table, onMove, onLinkStart, onAddColumn, activeAnchors, onRename, onRemove }) {
  const ref = useRef(null)
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handlePointerDown(event) {
    if (event.button !== 0 || event.target.closest('.button')) {
      return
    }

    const zone = ref.current.parentElement
    const zoneRect = zone.getBoundingClientRect()
    const tableRect = ref.current.getBoundingClientRect()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      offsetX: event.clientX - tableRect.left,
      offsetY: event.clientY - tableRect.top,
      zoneRect,
    }
    setDragging(true)
  }

  function handlePointerMove(event) {
    if (!drag.current) {
      return
    }

    const zone = ref.current.parentElement
    const { offsetX, offsetY, zoneRect } = drag.current
    const x = event.clientX - zoneRect.left - offsetX
    const y = event.clientY - zoneRect.top - offsetY
    onMove(table.id, x, y)
  }

  function handlePointerUp() {
    drag.current = null
    setDragging(false)
  }

  function handleAnchorPointerDown(event, anchor) {
    event.stopPropagation()
    onLinkStart(anchor, event)
  }

  function renderColumn(column) {
    const before = `table-${table.id}-${column}-before`
    const after = `table-${table.id}-${column}-after`

    return (
      <div key={column} className="table-column">
        {column}
        <IconKey size={16} stroke={1.5} color="black" fill="#D4AF37" />
        <button
          type="button"
          className={`dot before button${activeAnchors.has(before) ? ' actif' : ''}`}
          data-anchor={before}
          data-table={table.name}
          aria-label={`Créer un lien depuis ${table.name}.${column}`}
          onPointerDown={function handleBeforeAnchorPointerDown(event) {
            handleAnchorPointerDown(event, before)
          }}
        />
        <button
          type="button"
          className={`dot after button${activeAnchors.has(after) ? ' actif' : ''}`}
          data-anchor={after}
          data-table={table.name}
          aria-label={`Créer un lien depuis ${table.name}.${column}`}
          onPointerDown={function handleAfterAnchorPointerDown(event) {
            handleAnchorPointerDown(event, after)
          }}
        />
      </div>
    )
  }

  function handleAddColumnClick() {
    onAddColumn(table.id)
  }

  return (
    <div
      ref={ref}
      className={`table${dragging ? ' actif' : ''}`}
      style={{ left: table.x + "px" || '50px', top: table.y + "px" || '50px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      id={'table-' + table.id}
    >
      <Menu items={[
          { label: "Renomer", onClick: () => onRename(table.id) },
          { separator: true, label: "Suprimer", onClick: () => onRemove(table.id)}
      ]}>
        <h1 className="tableName">{table.name}</h1>
      </Menu>
      {table.column.map(renderColumn)}
      <button type="button" className="addColumnButton button" onClick={handleAddColumnClick}>
        +
      </button>
    </div>
  )
}

export default memo(Table)
