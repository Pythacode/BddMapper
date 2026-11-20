import { useRef, useState } from 'react'
import Button from './components/Button/Button'
import Zone from './components/Zone/Zone'
import ZoneButton from './components/ZoneButton/ZoneButton'
import { AlertCircle, Archive, Login, Logout, Trash } from '@getpapillon/papicons'
import { useSchemaStore } from './context/SchemaContext'
import './App.css'

function App() {
  const {
    schema,
    getTableById,
    addTable,
    renameTable,
    removeTable,
    addColumn,
    save,
    resetSchema,
    eraseSave,
    importJSON,
  } = useSchemaStore()
  const fileInputRef = useRef(null)
  const downloadRef = useRef(null)
  const [dialog, setDialog] = useState(null)
  const [screenMode, setScreenMode] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [notificationText, setNotificationText] = useState('')
  const [notificationVisible, setNotificationVisible] = useState(false)
  const [notificationIconColor, setNotificationIconColor] = useState('white')

  function showAlert(title, message = '') {
    setDialog({ type: 'alert', title, message })
  }

  function showPrompt(title, message, onSubmit) {
    setDialog({ type: 'prompt', title, message, onSubmit, value: '' })
  }

  function createTable() {
    function addTableWithName(name) {
      if (!name) return
      const tableAlreadyExists = schema.tables.some(function hasTableName(table) {
        return table.name === name
      })
      if (tableAlreadyExists) {
        showAlert('Nom déjà utilisé', 'Une table porte déjà ce nom.')
        return
      }
      addTable({ name, x: 50, y: 50, column: [] })
    }

    showPrompt('Nouvelle table', 'Entrez le nom de la nouvelle table', addTableWithName)
  }

  function renameTableWithId(id) {
    showPrompt('Renomer une table', 'Entrer le nouveau nom de la table', (v) => renameTable(id, v))
  }

  function createColumn(tableId) {
    function addColumnWithName(name) {
      if (!name) return

      const table = getTableById(tableId)

      if (table?.column.includes(name)) {
        showAlert('Nom déjà utilisé', 'Cette colonne existe déjà dans cette table.')
        return
      }
      addColumn(tableId, name)
    }

    showPrompt(
      'Nouvelle colonne',
      `Entrez le nom de la colonne pour ${tableId}`,
      addColumnWithName,
    )
  }

  function notify(message, color="white") {
    setNotificationText(message)
    setNotificationVisible(true)
    setNotificationIconColor(color)
    window.setTimeout(clearNotification, 5000)
  }

  function clearNotification() {
    setNotificationVisible(false)
    window.setTimeout(500, () => setNotificationText(''))
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = downloadRef.current
    if (!link) {
      URL.revokeObjectURL(url)
      showAlert('Export impossible', 'Le téléchargement ne peut pas être lancé.')
      return
    }
    link.href = url
    link.click()
    function releaseDownloadUrl() {
      URL.revokeObjectURL(url)
    }
    window.setTimeout(releaseDownloadUrl, 0)
  }

  async function handleImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      importJSON(JSON.parse(await file.text()))
      notify('Données importées.')
    } catch (error) {
      showAlert('Import impossible', error.message)
    }
  }

  function handleSave() {
    try {
      save()
      notify('Sauvegardé dans le navigateur.')
    } catch (error) {
      showAlert('Enregistrement impossible', error.message)
    }
  }

  function handleEraseSave() {
    try {
      eraseSave()
      notify('Sauvegarde effacée.')
    } catch (error) {
      showAlert('Effacement impossible', error.message)
    }
  }

  function closeDialog() {
    setDialog(null)
  }

  function submitDialog() {
    if (!dialog) return
    setDialog(null)
    if (dialog.type === 'prompt') dialog.onSubmit(dialog.value.trim())
  }

  function toggleScreenMode() {
    setScreenMode(!screenMode)
  }

  function toggleNavigation() {
    setNavOpen(!navOpen)
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function closeDialogOnBackdrop(event) {
    if (event.target === event.currentTarget) {
      closeDialog()
    }
  }

  function updatePromptValue(event) {
    const newValue = event.target.value
    setDialog(function updateDialog(currentDialog) {
      return { ...currentDialog, value: newValue }
    })
  }

  function handleDialogKeyDown(event) {
    if (event.key === 'Enter') {
      submitDialog()
    }
    if (event.key === 'Escape') {
      closeDialog()
    }
  }

  return (
    <>
      <main className={screenMode ? 'screen-mode' : ''}>
        <Zone onAddColumn={createColumn} onRenameTable={renameTableWithId} onRemoveTable={removeTable} onNotify={notify}>
          <ZoneButton
            onAddTable={createTable}
            screenMode={screenMode}
            onToggleScreenMode={toggleScreenMode}
            navOpen={navOpen}
            onToggleNav={toggleNavigation}
          />
        </Zone>
      </main>
      <nav className={navOpen ? 'nav-open' : ''} aria-label="Actions du schéma">
        <Button text="Exporter les données" Icon={Logout} onClick={exportJSON} style="rotate" />
        <Button text="Importer des données" Icon={Login} onClick={openFilePicker} style="-rotate" />
        <Button text="Enregistrer dans le navigateur" Icon={Archive} onClick={handleSave} />
        <Button text="Effacer la sauvegarde du navigateur" Icon={Trash} IconColor='red' onClick={handleEraseSave} />
        <div className="info">
          <p>Faites un clic droit sur le nom d’une table pour la renommer ou la supprimer.</p>
          <p>
            Icônes :
            {' '}
            <a href="https://github.com/PapillonApp/papicons" target="_blank" rel="noreferrer">Papicons</a>
            {' et '}
            <a href="https://tabler.io/icons" target="_blank" rel="noreferrer">Tabler Icons</a>.
          </p>
        </div>
      </nav>
      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
        aria-label="Choisir un fichier JSON"
      />
      <a ref={downloadRef} className="file-input" download="export.json" aria-hidden="true" />
      {dialog && (
        <div className="dialog-overlay" onMouseDown={closeDialogOnBackdrop}>
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <h2 id="dialog-title">{dialog.title}</h2>
            <p>{dialog.message}</p>
            {dialog.type === 'prompt' && (
              <input
                autoFocus
                type="text"
                value={dialog.value}
                onChange={updatePromptValue}
                onKeyDown={handleDialogKeyDown}
              />
            )}
            <button type="button" onClick={submitDialog}>
              {dialog.type === 'prompt' ? 'Valider' : 'Fermer'}
            </button>
          </section>
        </div>
      )}
      <div className={`notification${notificationVisible ? ' notification-visible' : ''}`} role="status">
        <AlertCircle size={20} color={notificationIconColor} aria-hidden="true" />
        <span>{notificationText}</span>
      </div>
    </>
  )
}

export default App
