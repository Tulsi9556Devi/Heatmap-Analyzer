import { useState } from 'react'

import DashboardLayout from '../components/layouts/DashboardLayout'
import MapShell from '../components/MapShell'

const AdminDashboard = () => {

  const [activeTab, setActiveTab] = useState('dashboard')

  const [complaints, setComplaints] = useState([
    {
      id: 1,
      citizen: 'Rahul Sharma',
      type: 'Pothole',
      area: 'Nerul',
      department: 'Road Maintenance',
      status: 'Pending'
    },

    {
      id: 2,
      citizen: 'Priya Verma',
      type: 'Garbage',
      area: 'Vashi',
      department: 'Sanitation',
      status: 'Resolved'
    },

    {
      id: 3,
      citizen: 'Amit Patil',
      type: 'Drainage',
      area: 'Belapur',
      department: 'Drainage',
      status: 'In Progress'
    }
  ])

  const updateStatus = (id, value) => {

    const updated = complaints.map((item) => {

      if (item.id === id) {
        return {
          ...item,
          status: value
        }
      }

      return item
    })

    setComplaints(updated)
  }

  const totalComplaints = complaints.length

  const pendingCount =
    complaints.filter(
      item => item.status === 'Pending'
    ).length

  const resolvedCount =
    complaints.filter(
      item => item.status === 'Resolved'
    ).length

  const progressCount =
    complaints.filter(
      item => item.status === 'In Progress'
    ).length

  const renderDashboard = () => {

    return (

      <div className="tab-page">

        <div className="admin-header">

          <div>

            <h1 className="page-title">
              Admin Dashboard
            </h1>

            <p className="admin-subtitle">
              Smart Public Complaint Monitoring System
            </p>

          </div>

        </div>

        <div className="admin-stats-grid">

          <div className="admin-stat-card">

            <h2>
              {totalComplaints}
            </h2>

            <p>
              Total Complaints
            </p>

          </div>

          <div className="admin-stat-card pending-card">

            <h2>
              {pendingCount}
            </h2>

            <p>
              Pending
            </p>

          </div>

          <div className="admin-stat-card progress-card">

            <h2>
              {progressCount}
            </h2>

            <p>
              In Progress
            </p>

          </div>

          <div className="admin-stat-card resolved-card">

            <h2>
              {resolvedCount}
            </h2>

            <p>
              Resolved
            </p>

          </div>

        </div>

        <div className="admin-map-wrapper">

          <MapShell />

        </div>

      </div>
    )
  }

  const renderManageComplaints = () => {

    return (

      <div className="tab-page">

        <div className="track-header">

          <h1 className="page-title">
            Manage Complaints
          </h1>

          <div className="track-count">
            Total : {complaints.length}
          </div>

        </div>

        <div className="table-container">

          <table className="complaint-table">

            <thead>

              <tr>

                <th>ID</th>
                <th>Citizen</th>
                <th>Complaint</th>
                <th>Area</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {
                complaints.map((item) => (

                  <tr key={item.id}>

                    <td>
                      #{item.id}
                    </td>

                    <td>
                      {item.citizen}
                    </td>

                    <td>
                      {item.type}
                    </td>

                    <td>
                      {item.area}
                    </td>

                    <td>
                      {item.department}
                    </td>

                    <td>

                      <span
                        className={`status-badge
                        ${
                          item.status === 'Resolved'
                          ? 'resolved-badge'
                          : item.status === 'In Progress'
                          ? 'progress-badge'
                          : 'pending-badge'
                        }`}
                      >

                        {item.status}

                      </span>

                    </td>

                    <td>

                      <select
                        className="admin-action-select"
                        value={item.status}
                        onChange={(e) =>
                          updateStatus(
                            item.id,
                            e.target.value
                          )
                        }
                      >

                        <option>
                          Pending
                        </option>

                        <option>
                          In Progress
                        </option>

                        <option>
                          Resolved
                        </option>

                      </select>

                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        </div>

      </div>
    )
  }

  const renderAnalytics = () => {

    return (

      <div className="tab-page">

        <h1 className="page-title">
          Analytics
        </h1>

        <div className="analytics-grid">

          <div className="analytics-card">

            <h2>
              Most Complaints Area
            </h2>

            <p>
              Nerul Sector 5
            </p>

          </div>

          <div className="analytics-card">

            <h2>
              Most Common Issue
            </h2>

            <p>
              Potholes
            </p>

          </div>

          <div className="analytics-card">

            <h2>
              Resolution Rate
            </h2>

            <p>
              74%
            </p>

          </div>

        </div>

      </div>
    )
  }

  const renderContent = () => {

    if (activeTab === 'complaints') {
      return renderManageComplaints()
    }

    if (activeTab === 'heatmap') {
      return renderAnalytics()
    }

    return renderDashboard()
  }

  return (

    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >

      {renderContent()}

    </DashboardLayout>
  )
}

export default AdminDashboard