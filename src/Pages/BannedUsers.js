import React, { useState, useEffect } from 'react'
import { getallBannedUsers, unbanUser } from '../services/allApi'
import { Table, Card, Row, Col, Spinner, Modal, Button } from 'react-bootstrap'
import { FaBan, FaEllipsisV } from 'react-icons/fa'
import { toast, ToastContainer } from 'react-toastify'

function BannedUsers() {
  const [bannedUsers, setBannedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    fetchBannedUsers()
  }, [])

  const fetchBannedUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getallBannedUsers()
      
      // Assuming the API returns data directly or response.data
      const userData = response.data || response
      setBannedUsers(userData)
    } catch (err) {
      // console.error('Error fetching banned users:', err)
      setError('Failed to load banned users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user) => {
    setSelectedUser(user)
    setShowActionModal(true)
  }

  const handleCloseModal = () => {
    setShowActionModal(false)
    setSelectedUser(null)
  }

  const handleUnbanUser = async (userId) => {
    try {
      await unbanUser(userId)
      setBannedUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
      handleCloseModal()
      toast.success("User unbanned successfully!")
    } catch (err) {
      // console.error("Error unbanning user:", err.message)
      toast.error(`Error unbanning user: ${err.message}`)
    }
  }

  const StatusBadge = ({ status }) => {
    let badgeStyle = {
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: '#e74c3c'
    }

    return <span style={badgeStyle}>Banned</span>
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (error) {
    return <div className="text-danger">Error: {error}</div>
  }

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="mb-4">Banned Users</h2>

      {/* Statistics Card */}
      <div className="d-flex justify-content-end mb-3">
        <Card className="p-2 text-center employee-summary-card">
          <Row>
            <Col className="summary-item">
              <p>Total Banned</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-person-x-fill text-danger me-2"></i>
                <span className="text-danger">{bannedUsers.length}</span>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {bannedUsers.length === 0 ? (
        <Card className="text-center p-5">
          <i className="bi bi-people text-muted" style={{fontSize: '4rem'}}></i>
          <h4 className="text-muted mt-3">No Banned Users</h4>
          <p className="text-muted">There are currently no banned users in the system.</p>
        </Card>
      ) : (
        <>
          <Table hover responsive="sm" className="request-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Mobile Number</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody style={{cursor:'pointer'}}>
              {bannedUsers.map((user) => (
                <tr key={user.id}>
                    <td>{user.id}</td>
                  <td>
                    {user.user_id}
                    
                  </td>
                  <td>{user.mobile_number}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#e74c3c'
                    }}>
                      Banned
                    </span>
                  </td>
                  <td>
                    <FaEllipsisV
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenModal(user)
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* Action Modal */}
      {selectedUser && (
        <Modal
          show={showActionModal}
          onHide={handleCloseModal}
          dialogClassName="custom-modal-width"
          style={{
            width: '25%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Modal.Body>
            <div className="d-flex flex-column">
              <Button 
                variant="link" 
                style={{ color: 'black' }} 
                className="text-start"
                onClick={() => handleUnbanUser(selectedUser.id)}
              >
                <FaBan className="me-2" /> Unban User
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}

export default BannedUsers