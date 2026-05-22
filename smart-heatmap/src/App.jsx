import './App.css'

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DepartmentDashboard from './pages/DepartmentDashboard'

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/user-dashboard"
          element={<UserDashboard />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        <Route
  path="/department-dashboard"
  element={
    <h1>
      Department Route Working ✅
    </h1>
  }
/>

      </Routes>

    </BrowserRouter>
  )
}

export default App