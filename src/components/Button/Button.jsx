import './Button.css'

function Button({ text, Icon, onClick, style = '' }) {
  return (
    <button type="button" onClick={onClick}>
      <span className={style}>
        <Icon size="32" color="white" />
        <span>{text}</span>
      </span>
    </button>
  )
}

export default Button
