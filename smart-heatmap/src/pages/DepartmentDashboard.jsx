import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layouts/DashboardLayout'
import { supabase } from '../services/supabase'

const DepartmentDashboard = () => {

  const [activeTab, setActiveTab] =
    useState('dashboard')

  const [complaints, setComplaints] =
    useState([])

  const userData =
    JSON.parse(
      localStorage.getItem('user')
    )

  const getDepartmentKeyFromText = (value) => {

    const text =
      String(value || '').toLowerCase()

    if (
      text.includes('road') ||
      text.includes('pothole')
    ) {
      return 'roads'
    }

    if (
      text.includes('clean') ||
      text.includes('sanitation') ||
      text.includes('garbage') ||
      text.includes('drainage')
    ) {
      return 'cleaning'
    }

    if (
      text.includes('electric') ||
      text.includes('electrical') ||
      text.includes('streetlight') ||
      text.includes('light')
    ) {
      return 'electric'
    }

    return 'civic'
  }

  const departmentKey =
    getDepartmentKeyFromText(
      userData?.department ||
      userData?.dept_name ||
      userData?.full_name ||
      userData?.name ||
      userData?.email
    )

  useEffect(() => {

    fetchComplaints()

    const complaintsChannel =
      supabase
        .channel('department-complaints-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'complaints'
          },
          () => {
            fetchComplaints()
          }
        )
        .subscribe()

    return () => {
      supabase.removeChannel(complaintsChannel)
    }

  }, [])

  const fetchComplaints = async () => {

    const { data, error } =
      await supabase
        .from('complaints')
        .select('*')
        .in(
          'status',
          [
            'Reached to Department',
            'In Progress',
            'Resolved'
          ]
        )
        .order('id', { ascending: false })

    if (error) {

      console.log(error)
      return
    }

    setComplaints(
      data.filter(
        item =>
          getDepartmentKeyFromText(
            item.complaint_type
          ) === departmentKey
      )
    )
  }

  const markComplete = async (id) => {

    setComplaints((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Resolved',
              progress: 100
            }
          : item
      )
    )

    const {
      data,
      error
    } =
      await supabase
        .from('complaints')
        .update({
          status: 'Resolved',
          progress: 100
        })
        .eq('id', id)
        .select()

    if (error) {

      console.log('COMPLETE UPDATE ERROR:', error)
      alert(`Completion update failed: ${error.message}`)
      fetchComplaints()
      return
    }

    if (!data || data.length === 0) {

      console.log(
        'COMPLETE UPDATE RETURNED NO ROWS',
        { id }
      )
      alert(
        'Completion update failed: Supabase did not update this complaint. Check update/RLS policy for complaints table.'
      )
      fetchComplaints()
      return
    }

    fetchComplaints()
  }

  const getDepartmentName = (type) => {

    const key =
      getDepartmentKeyFromText(type)

    if (key === 'cleaning') {
      return 'Cleaning'
    }

    if (key === 'roads') {
      return 'Roads'
    }

    if (key === 'electric') {
      return 'Electric'
    }

    return 'Civic'
  }

  const departmentDisplayName =
    getDepartmentName(
      userData?.department ||
      userData?.dept_name ||
      userData?.full_name ||
      userData?.name ||
      userData?.email
    )

  const activeComplaints =
    complaints.filter(
      item =>
        item.status === 'Reached to Department' ||
        item.status === 'In Progress'
    )

  const resolvedComplaints =
    complaints.filter(
      item =>
        item.status === 'Resolved'
    )

  const getDisplayStatus = (status) => {

    if (
      status === 'In Progress' ||
      status === 'Reached to Department'
    ) {
      return 'Reached to Department'
    }

    return status || 'Reached to Department'
  }

  const renderDashboard = () => {

    return (

      <div className="tab-page">

        <div className="track-header">

          <div>

            <h1 className="page-title">
              {departmentDisplayName}
            </h1>

            <p className="admin-subtitle">
              Complaints forwarded by admin for this department.
            </p>

          </div>

        </div>

        <div className="admin-stats-grid department-stats-grid">

          <div className="admin-stat-card">
            <h2>{complaints.length}</h2>
            <p>Total Forwarded</p>
          </div>

          <div className="admin-stat-card progress-card">
            <h2>{activeComplaints.length}</h2>
            <p>Pending Action</p>
          </div>

          <div className="admin-stat-card resolved-card">
            <h2>{resolvedComplaints.length}</h2>
            <p>Completed</p>
          </div>

        </div>

        {
          complaints.length
          ? renderComplaints()
          : (
            <div className="empty-workflow-state">
              No forwarded complaints for this department yet.
            </div>
          )
        }

      </div>
    )
  }

  const renderComplaints = () => {

    return (

      <div className="complaint-progress-list">

        {
          complaints.map((item) => (

            <div
              key={item.id}
              className="progress-card-box"
            >

              <div className="progress-top">

                <div>

                  <h2>
                    {item.complaint_type}
                  </h2>

                  <p>
                    {item.full_name}
                  </p>

                </div>

                <span
                  className={`status-badge ${
                    item.status === 'Resolved'
                    ? 'resolved-badge'
                    : 'progress-badge'
                  }`}
                >
                  {getDisplayStatus(item.status)}
                </span>

              </div>

              <div className="department-line">
                Department : {getDepartmentName(item.complaint_type)}
              </div>

              <div className="progress-location">
                Location :
                {' '}
                {item.latitude?.toFixed(4)},
                {' '}
                {item.longitude?.toFixed(4)}
              </div>

              <div className="progress-bar-wrapper">

                <div
                  className="progress-bar-fill"
                  style={{
                    width:
                      item.status === 'Resolved'
                      ? '100%'
                      : '65%'
                  }}
                ></div>

              </div>

              <div className="progress-bottom">

                <span>
                  Progress :
                  {' '}
                  {item.status === 'Resolved' ? '100' : '65'}%
                  {' '}
                  -
                  {' '}
                  {
                    item.status === 'Resolved'
                    ? 'Completed by department'
                    : 'Reached to department'
                  }
                </span>

                {
                  item.status === 'Resolved'
                  ? (
                    <button
                      type="button"
                      className="workflow-action-btn completed-action"
                      disabled
                    >
                      Completed
                    </button>
                  )
                  : (
                    <button
                      type="button"
                      className="workflow-action-btn"
                      onClick={() =>
                        markComplete(item.id)
                      }
                    >
                      Mark Complete
                    </button>
                  )
                }

              </div>

            </div>
          ))
        }

      </div>
    )
  }

  const renderContent = () => {

    if (activeTab === 'complaints') {
      return (
        <div className="tab-page">
          <div className="track-header">
            <h1 className="page-title">
              Department Complaints
            </h1>
            <div className="track-count">
              Total : {complaints.length}
            </div>
          </div>
          {
            complaints.length
            ? renderComplaints()
            : (
              <div className="empty-workflow-state">
                No forwarded complaints for this department yet.
              </div>
            )
          }
        </div>
      )
    }

    return renderDashboard()
  }

  return (

    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userData={userData}
    >

      {renderContent()}

    </DashboardLayout>
  )
}

export default DepartmentDashboard
