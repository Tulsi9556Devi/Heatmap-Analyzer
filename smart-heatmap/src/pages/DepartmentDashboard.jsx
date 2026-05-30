import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layouts/DashboardLayout'
import HeatMapShell from '../components/HeatMapShell'
import { supabase } from '../services/supabase'

const DepartmentDashboard = () => {

  const [activeTab, setActiveTab] =
    useState('dashboard')

  const [complaints, setComplaints] =
    useState([])

  const [completionProofs, setCompletionProofs] =
    useState({})

  const userData = {
    ...JSON.parse(
      localStorage.getItem('user') || '{}'
    ),
    role: 'department'
  }

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

  const handleProofChange = (
    id,
    file
  ) => {

    setCompletionProofs((prev) => ({
      ...prev,
      [id]: file
    }))
  }

  const isMissingWorkflowColumnError = (error) =>
    error?.message?.includes('schema cache') ||
    error?.message?.includes('completion_image_url') ||
    error?.message?.includes('notification_sent') ||
    error?.message?.includes('notification_sent_at')

  const markComplete = async (id) => {

    const proofFile =
      completionProofs[id]

    if (!proofFile) {
      alert('Please upload proof of completion before marking complete.')
      return
    }

    const fileName =
      `completion-${id}-${Date.now()}-${proofFile.name}`

    const { error: uploadError } =
      await supabase.storage
        .from('complaint-images')
        .upload(fileName, proofFile)

    if (uploadError) {

      console.log('PROOF UPLOAD ERROR:', uploadError)
      alert('Proof upload failed')
      return
    }

    const {
      data: imageData
    } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(fileName)

    const completionImageUrl =
      imageData.publicUrl

    const now =
      new Date().toISOString()

    setComplaints((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Resolved',
              progress: 100,
              completion_image_url:
                completionImageUrl,
              notification_sent: true,
              notification_sent_at: now
            }
          : item
      )
    )

    let {
      data,
      error
    } =
      await supabase
        .from('complaints')
        .update({
          status: 'Resolved',
          progress: 100,
          completion_image_url:
            completionImageUrl,
          notification_sent: true,
          notification_sent_at: now
        })
        .eq('id', id)
        .select()

    if (
      error &&
      isMissingWorkflowColumnError(error)
    ) {
      const retry =
        await supabase
          .from('complaints')
          .update({
            status: 'Resolved',
            progress: 100
          })
          .eq('id', id)
          .select()

      data = retry.data
      error = retry.error
    }

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

    setCompletionProofs((prev) => {

      const next = {
        ...prev
      }

      delete next[id]
      return next
    })

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

  const getLocationText = (item) => {

    const latitude =
      Number(item.latitude)

    const longitude =
      Number(item.longitude)

    const coordinates =
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
        ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        : ''

    return (
      item.location_name ||
      item.area_name ||
      item.area ||
      item.location ||
      coordinates ||
      'Location not available'
    )
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
                {getLocationText(item)}
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
                  item.status === 'Resolved' &&
                  item.notification_sent
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
                    <div className="proof-action-group">

                      <input
                        type="file"
                        accept="image/*"
                        className="proof-input"
                        onChange={(event) =>
                          handleProofChange(
                            item.id,
                            event.target.files[0]
                          )
                        }
                      />

                      <button
                        type="button"
                        className="workflow-action-btn"
                        onClick={() =>
                          markComplete(item.id)
                        }
                      >
                        Send Completion
                      </button>

                    </div>
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

    if (activeTab === 'heatmap') {
      return (
        <div className="tab-page department-heatmap-page">

          <div className="track-header">

            <h1 className="page-title">
              Department Heatmap
            </h1>

            <div className="track-count">
              Total : {complaints.length}
            </div>

          </div>

          <div className="admin-map-wrapper department-heatmap-wrapper">
            <HeatMapShell complaints={complaints} />
          </div>

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
