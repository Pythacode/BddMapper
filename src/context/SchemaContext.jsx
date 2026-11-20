import { createContext, useContext } from 'react'
import { useSchema } from '../hooks/useSchema'

const SchemaContext = createContext(null)

export function SchemaProvider({ children }) {
  const schema = useSchema()
  return (
    <SchemaContext.Provider value={schema}>
      {children}
    </SchemaContext.Provider>
  )
}

export function useSchemaStore() {
  const schemaStore = useContext(SchemaContext)
  if (!schemaStore) {
    throw new Error('useSchemaStore doit être utilisé dans <SchemaProvider>')
  }

  return schemaStore
}