import { useCallback, useRef, useState } from 'react'
import { useSchemaStore } from '../../context/SchemaContext'
import Table from '../Table/Table'
import Links from '../Links/Links'
import './Zone.css'

function Zone({ children, onAddColumn, onRenameTable, onRemoveTable }) {
  const { schema, moveTable, addLink, removeLink } = useSchemaStore()
  const zoneRef = useRef(null)
  const linkDrag = useRef(null)
  const drag = useRef(null)
  const [ghost, setGhost] = useState(null)
  const activeAnchors = new Set(
    schema.links.flatMap(function getLinkAnchors(link) {
      return [link.start, link.end]
    })
  )

  const getPoint = useCallback(function getPointInZone(event) {
    const rect = zoneRef.current.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }, [])

  const handleLinkStart = useCallback(function startLinkDrag(start, event) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    linkDrag.current = { start, table: event.currentTarget.dataset.table }
    const point = getPoint(event)
    setGhost({ ...point, startX: point.x, startY: point.y })
  }, [getPoint])

  function handlePointerMove(event) {
    if (!(linkDrag.current || drag.current)) {
      return
    }

    if (drag.current) {
      const { startX, startY, tables } = drag.current
      const deltaX = Math.round(event.clientX - startX)
      const deltaY = Math.round(event.clientY - startY)

      tables.forEach(function moveTableWithZone(table) {
        moveTable(table.id, table.x + deltaX, table.y + deltaY)
      })
    } else {

      const point = getPoint(event)
      setGhost(function updateGhostPosition(currentGhost) {
        if (!currentGhost) {
          return currentGhost
        }

        return { ...currentGhost, ...point }
      })
    }
  }

  function handlePointerUp(event) {
    const linkDragging = linkDrag.current
    const dragging = drag.current
    if (!(linkDragging || dragging)) {
      return
    }

    if (dragging) {
      drag.current = null
    } else {
      linkDrag.current = null
      setGhost(null)
      const target = document.elementFromPoint(event.clientX, event.clientY)
        ?.closest('[data-anchor]')
      if (!target) {
        return
      }

      const end = target.dataset.anchor
      if (linkDragging.start === end) {
        schema.links
          .filter((link) => {
            return link.start === end || link.end === end
          })
          .forEach((link) => {
            removeLink(link.start, link.end)
          })
        return
      }

      if (target.dataset.table === linkDragging.table) {
        return
      }

      addLink({ start: linkDragging.start, end })
    }
  }

  function handlePointerCancel() {
    linkDrag.current = null
    drag.current = null
    setGhost(null)
  }

  function handlePointerDown(event) {
    if (event.target !== event.currentTarget) {
      return
    }

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      tables: schema.tables.map(function captureTablePosition(table) {
        const element = document.getElementById(`table-${table.id}`)
        return {
          id: table.id,
          x: table.x,
          y: table.y,
          width: element?.offsetWidth ?? 0,
          height: element?.offsetHeight ?? 0,
        }
      }),
    }
  }

  const ghostPath = ghost
    ? `M ${ghost.startX} ${ghost.startY} C ${(ghost.startX + ghost.x) / 2} ${ghost.startY}, ${(ghost.startX + ghost.x) / 2} ${ghost.y}, ${ghost.x} ${ghost.y}`
    : null

  return (
    <div
      id="zone"
      ref={zoneRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
    >
      {schema.tables.map(function renderTable(table) {
        return (
          <Table
            key={table.name}
            table={table}
            onMove={moveTable}
            onLinkStart={handleLinkStart}
            onAddColumn={onAddColumn}
            activeAnchors={activeAnchors}
            onRename={onRenameTable}
            onRemove={onRemoveTable}
          />
        )
      })}
      {ghost && (
        <svg className="ghost" aria-hidden="true">
          <path d={ghostPath} />
        </svg>
      )}
      <Links zoneRef={zoneRef} />
      {children}
    </div>
  )
}

export default Zone
