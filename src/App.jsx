import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Hello Katrina! 👋</h1>
      <p>이건 내가 만든 첫 번째 React 앱이야 🎉</p>
      <p>버튼을 {count}번 눌렀어요!</p>
      <button onClick={() => setCount(count + 1)}>
        클릭해보세요
      </button>
    </div>
  )
}

export default App
