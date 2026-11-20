import './Button.css'

function Button({ text, Icon, onClick, IconColor = 'white', style = '' }) {
  return (
    <button type="button" onClick={onClick}>
      <span className={style}>
        <Icon size="32" color={IconColor} />
        <span>{text}</span>
      </span>
    </button>
  )
}

export default Button
