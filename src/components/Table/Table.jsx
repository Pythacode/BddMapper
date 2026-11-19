import { memo, useRef, useState } from 'react'
import './Table.css'

function Table({ table, onMove, onLinkStart, onAddColumn, activeAnchors }) {
  const ref = useRef(null)
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handlePointerDown(event) {
    if (event.target.closest('.button')) {
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
    const x = Math.max(0, Math.min(
      event.clientX - zoneRect.left - offsetX,
      zone.clientWidth - ref.current.offsetWidth,
    ))
    const y = Math.max(0, Math.min(
      event.clientY - zoneRect.top - offsetY,
      zone.clientHeight - ref.current.offsetHeight,
    ))
    onMove(table.name, `${x}px`, `${y}px`)
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
    const before = `column-${table.name}-${column}-before`
    const after = `column-${table.name}-${column}-after`

    return (
      <div key={column} className="table-column">
        {column}
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
    onAddColumn(table.name)
  }

  return (
    <div
      ref={ref}
      className={`table${dragging ? ' actif' : ''}`}
      style={{ left: table.x || '50px', top: table.y || '50px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <h1 className="tableName">{table.name}</h1>
      {table.column.map(renderColumn)}
      <button type="button" className="addColumnButton button" onClick={handleAddColumnClick}>
        +
      </button>
    </div>
  )
}

export default memo(Table)
