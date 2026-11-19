import { useState } from 'react'

const STORAGE_KEY = 'session'
const LEGACY_STORAGE_KEY = 'bddmapper_schema'
const EMPTY_SCHEMA = { tables: [], links: [] }

function isSchema(value) {
  return value
    && Array.isArray(value.tables)
    && Array.isArray(value.links)
    && value.tables.every(function hasValidTable(table) {
      return table
        && typeof table.name === 'string'
        && Array.isArray(table.column)
    })
    && value.links.every(function hasValidLink(link) {
      return link
        && typeof link.start === 'string'
        && typeof link.end === 'string'
    })
}

function readSavedSchema() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
      ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!saved) return EMPTY_SCHEMA

    const parsed = JSON.parse(saved)
    if (!isSchema(parsed)) throw new Error('Format de sauvegarde invalide')
    return parsed
  } catch (error) {
    console.error('Impossible de lire la sauvegarde du schéma.', error)
    return EMPTY_SCHEMA
  }
}

export function useSchema() {
  const [schema, setSchema] = useState(readSavedSchema)

  function addTable(table) {
    setSchema(function addTableToCurrentSchema(currentSchema) {
      const tableAlreadyExists = currentSchema.tables.some(function hasTableName(item) {
        return item.name === table.name
      })
      if (tableAlreadyExists) {
        return currentSchema
      }

      return {
        ...currentSchema,
        tables: [...currentSchema.tables, { ...table, column: table.column ?? [] }],
      }
    })
  }

  function moveTable(name, x, y) {
    setSchema(function moveTableInCurrentSchema(currentSchema) {
      const updatedTables = currentSchema.tables.map(function updateTablePosition(table) {
        if (table.name !== name) {
          return table
        }

        return { ...table, x, y }
      })

      return { ...currentSchema, tables: updatedTables }
    })
  }

  function addColumn(name, column) {
    setSchema(function addColumnToCurrentSchema(currentSchema) {
      const updatedTables = currentSchema.tables.map(function updateTableColumns(table) {
        if (table.name !== name || table.column.includes(column)) {
          return table
        }

        return { ...table, column: [...table.column, column] }
      })

      return { ...currentSchema, tables: updatedTables }
    })
  }

  function addLink(link) {
    setSchema(function addLinkToCurrentSchema(currentSchema) {
      const linkAlreadyExists = currentSchema.links.some(function isSameLink(item) {
        return item.start === link.start && item.end === link.end
      })
      if (linkAlreadyExists) {
        return currentSchema
      }

      return { ...currentSchema, links: [...currentSchema.links, link] }
    })
  }

  function removeLink(start, end) {
    setSchema(function removeLinkFromCurrentSchema(currentSchema) {
      const remainingLinks = currentSchema.links.filter(function keepOtherLinks(link) {
        return !(link.start === start && link.end === end)
      })

      return { ...currentSchema, links: remainingLinks }
    })
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schema))
  }

  function eraseSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(EMPTY_SCHEMA))
    setSchema(EMPTY_SCHEMA)
  }

  function importJSON(data) {
    if (!isSchema(data)) {
      throw new Error('Le fichier doit contenir des tableaux « tables » et « links » valides.')
    }

    setSchema(data)
  }

  return {
    schema,
    addTable,
    moveTable,
    addColumn,
    addLink,
    removeLink,
    save,
    eraseSave,
    importJSON,
  }
}
