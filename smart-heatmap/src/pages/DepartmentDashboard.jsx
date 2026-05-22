import { useState } from 'react'
import DashboardLayout from '../components/layouts/DashboardLayout'

const DepartmentDashboard = () => {

  const [activeTab, setActiveTab] =
    useState('dashboard')

  const userData =
    JSON.parse(
      localStorage.getItem('user')
    )

  return (

    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userData={userData}
    >

      <div
        style={{
          padding: '30px'
        }}
      >

        <h1
          style={{
            fontSize: '32px',
            marginBottom: '10px'
          }}
        >
          Department Dashboard
        </h1>

        <p
          style={{
            fontSize: '18px'
          }}
        >
          Redirect Successful ✅
        </p>

        <div
          style={{
            marginTop: '30px',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}
        >

          <div className="admin-stat-card">

            <h2>
              120
            </h2>

            <p>
              Total Complaints
            </p>

          </div>

          <div className="admin-stat-card pending-card">

            <h2>
              40
            </h2>

            <p>
              Pending
            </p>

          </div>

          <div className="admin-stat-card progress-card">

            <h2>
              55
            </h2>

            <p>
              In Progress
            </p>

          </div>

          <div className="admin-stat-card resolved-card">

            <h2>
              25
            </h2>

            <p>
              Resolved
            </p>

          </div>

        </div>

      </div>

    </DashboardLayout>
  )
}

export default DepartmentDashboard