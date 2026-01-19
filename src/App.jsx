import { useState } from 'react'
import { Header } from './components/Header'
import { Search } from './components/Search'
import './App.css'

function App() {

  return (
    <>
      <main className="container">
        <Header />
        <h1>How's the sky looking today?</h1>
        <Search />
      </main>
    </>
  )
}

export default App
