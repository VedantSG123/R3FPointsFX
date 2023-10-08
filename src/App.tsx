import "./App.css"
import Experience from "./Experience"
import { useState } from "react"
import Select from "./Select"
function App() {
  const [current, setCurrent] = useState(0)
  const changeModel = (selected: number) => setCurrent(selected)
  return (
    <>
      <Select count={3} changeNumber={changeModel} />
      <div className="canvas-container">
        <Experience current={current} />
      </div>
    </>
  )
}

export default App
