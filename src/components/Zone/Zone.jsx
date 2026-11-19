import { useCallback, useRef, useState } from 'react'
import { useSchemaStore } from '../../context/SchemaContext'
import Table from '../Table/Table'
import Links from '../Links/Links'
import './Zone.css'

function Zone({ children, onAddColumn }) {
  const { schema, moveTable, addLink, removeLink } = useSchemaStore()
  const zoneRef = useRef(null)
  const linkDrag = useRef(null)
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
    if (!linkDrag.current) {
      return
    }

    const point = getPoint(event)
    setGhost(function updateGhostPosition(currentGhost) {
      if (!currentGhost) {
        return currentGhost
      }

      return { ...currentGhost, ...point }
    })
  }

  function handlePointerUp(event) {
    const dragging = linkDrag.current
    if (!dragging) {
      return
    }

    linkDrag.current = null
    setGhost(null)
    const target = document.elementFromPoint(event.clientX, event.clientY)
      ?.closest('[data-anchor]')
    if (!target) {
      return
    }

    const end = target.dataset.anchor
    if (dragging.start === end) {
      schema.links
        .filter(function isConnectedToAnchor(link) {
          return link.start === end || link.end === end
        })
        .forEach(function removeLinkConnectedToAnchor(link) {
          removeLink(link.start, link.end)
        })
      return
    }

    if (target.dataset.table === dragging.table) {
      return
    }

    addLink({ start: dragging.start, end })
  }

  function handlePointerCancel() {
    linkDrag.current = null
    setGhost(null)
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
