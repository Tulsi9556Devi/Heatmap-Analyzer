import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import Login from '../pages/Login'
import UserDashboard from '../pages/UserDashboard'
import AdminDashboard from '../pages/AdminDashboard'
import DepartmentDashboard from '../pages/DepartmentDashboard'

const AppRoutes = () => {

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
          element={<DepartmentDashboard/>}
        />
        <Route
          path="*"
          element={<Navigate to="/" />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default AppRoutes