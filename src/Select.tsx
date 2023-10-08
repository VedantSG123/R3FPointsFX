type properties = {
  count: number
  changeNumber: (current: number) => void
}

function Select({ count, changeNumber }: properties) {
  const buttons = Array.from({ length: count }, (value, index) => (
    <div
      className="select-element"
      onClick={() => changeNumber(index)}
      key={index}
    >{`Mesh ${index + 1}`}</div>
  ))

  return <div className="select-container">{buttons}</div>
}

export default Select
