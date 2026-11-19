import { useEffect, useState } from 'react'
import { useSchemaStore } from '../../context/SchemaContext'
import './Links.css'

function Links({ zoneRef }) {
  const { schema, removeLink } = useSchemaStore()
  const [paths, setPaths] = useState({})

  useEffect(function updateLinkPathsAfterRender() {
    const zone = zoneRef.current
    if (!zone) {
      return undefined
    }

    function updatePaths() {
      const bounds = zone.getBoundingClientRect()
      const anchors = Array.from(zone.querySelectorAll('[data-anchor]'))
      const nextPaths = {}

      schema.links.forEach(function buildPathForLink(link) {
        const start = anchors.find(function findStartAnchor(anchor) {
          return anchor.dataset.anchor === link.start
        })
        const end = anchors.find(function findEndAnchor(anchor) {
          return anchor.dataset.anchor === link.end
        })
        if (!start || !end) {
          return
        }

        const startRect = start.getBoundingClientRect()
        const endRect = end.getBoundingClientRect()
        const x1 = startRect.left + startRect.width / 2 - bounds.left
        const y1 = startRect.top + startRect.height / 2 - bounds.top
        const x2 = endRect.left + endRect.width / 2 - bounds.left
        const y2 = endRect.top + endRect.height / 2 - bounds.top
        const dx = (x2 - x1) / 2
        nextPaths[JSON.stringify([link.start, link.end])] =
          `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
      })

      setPaths(nextPaths)
    }

    updatePaths()
    const observer = new ResizeObserver(updatePaths)
    observer.observe(zone)
    function stopObservingZone() {
      observer.disconnect()
    }

    return stopObservingZone
  }, [schema, zoneRef])

  function removeSelectedLink(link) {
    removeLink(link.start, link.end)
  }

  function handleLinkKeyDown(event, link) {
    if (event.key === 'Enter' || event.key === ' ') {
      removeLink(link.start, link.end)
    }
  }

  return (
    <svg className="links" aria-label="Liens entre colonnes">
      {schema.links.map(function renderLink(link) {
        const linkKey = JSON.stringify([link.start, link.end])

        return (
          <path
            key={linkKey}
            d={paths[linkKey] ?? ''}
            data-start={link.start}
            data-end={link.end}
            onClick={function handleClick() {
              removeSelectedLink(link)
            }}
            role="button"
            tabIndex={0}
            aria-label={`Supprimer le lien entre ${link.start} et ${link.end}`}
            onKeyDown={function handleKeyDown(event) {
              handleLinkKeyDown(event, link)
            }}
          />
        )
      })}
    </svg>
  )
}

export default Links
