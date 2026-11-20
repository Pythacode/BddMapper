import { Add, ChevronLeft } from '@getpapillon/papicons'
import './ZoneButton.css'

function ZoneButton({
  onAddTable,
  screenMode,
  onToggleScreenMode,
  navOpen,
  onToggleNav,
}) {
  return (
    <>
      <button id="newTableButton" type="button" onClick={onAddTable} aria-label="Ajouter une table">
        <Add size="32" color="white" />
      </button>
      <label id="modScreen">
        <span className="switch">
          <input type="checkbox" checked={screenMode} onChange={onToggleScreenMode} />
          <span className="slider round" />
        </span>
        <span>Mode capture d’écran</span>
      </label>
      <button
        id="openNav"
        type="button"
        onClick={onToggleNav}
        aria-label={navOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={navOpen}
      >
        <ChevronLeft size={32} color="white" />
      </button>
    </>
  )
}

export default ZoneButton
