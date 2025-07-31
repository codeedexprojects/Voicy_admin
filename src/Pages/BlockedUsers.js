import React, { useState, useEffect } from 'react'
import {  getallBlockedUsers } from '../services/allApi'
import { Table, Card, Row, Col, Spinner } from 'react-bootstrap'
import { FaEllipsisV } from 'react-icons/fa'

function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBlockedUsers()
  }, [])

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getallBlockedUsers()
      
      // Assuming the API returns data directly or response.data
      const userData = response.data || response
      setBlockedUsers(userData)
    } catch (err) {
      // console.error('Error fetching banned users:', err)
      setError('Failed to load banned users. Please try again.')
    } finally {
      setLoading(false)
    }
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
     
      <h2 className="mb-4">Blocked Users</h2>

      {/* Statistics Card */}
      <div className="d-flex justify-content-end mb-3">
        <Card className="p-2 text-center employee-summary-card">
          <Row>
            <Col className="summary-item">
              <p>Total Blocked</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-person-x-fill text-danger me-2"></i>
                <span className="text-danger">{blockedUsers.length}</span>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {blockedUsers.length === 0 ? (
        <Card className="text-center p-5">
          <i className="bi bi-people text-muted" style={{fontSize: '4rem'}}></i>
          <h4 className="text-muted mt-3">No Blocked Users</h4>
          <p className="text-muted">There are currently no blocked users in the system.</p>
        </Card>
      ) : (
        <>
          <Table hover responsive="sm" className="request-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Executive ID</th>
                <th>blocked_at</th>
                <th>Reason</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody style={{cursor:'pointer'}}>
              {blockedUsers.map((user) => (
                <tr key={user.id}>
                    <td>{user.id}</td>
                  <td>
                    {user.user_id}
                    
                  </td>
                  <td>{user.executive_id}</td>
                  <td>{user.blocked_at}</td>
                  <td>{user.reason}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#e74c3c'
                    }}>
                      Blocked
                    </span>
                  </td>
                  <td>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

     
    </div>
  )
}

export default BlockedUsers