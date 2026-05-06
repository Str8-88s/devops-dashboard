import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div>Dashboard page</div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App