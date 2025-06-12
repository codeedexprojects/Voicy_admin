import React, { useEffect, useState } from 'react';
import {
  Table, Form, Button, Pagination, Card, Row, Col, Modal,
  Spinner
} from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBan, FaEllipsisV, FaPhoneSlash, FaSearch, FaUserEdit } from 'react-icons/fa';
import { banUser, getAllUsers, suspendUser, unbanUser, unsuspendUser } from '../services/allApi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';


const UsersList = () => {
  const [showModal, setShowModal] = useState(false); 
  const [selectedOption, setSelectedOption] = useState(''); 
  const [users, setUsers] = useState([]);
  const [userstatstics, setUserstatstics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]); // Store filtered results
  const [page, setPage] = useState(1); // Current page state
  const itemsPerPage = 10; // Number of items per page
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const handleOpenModal = (users) =>{
    setSelectedUser(users);

     setShowActionModal(true);
  };
const handleCloseModal = () => setShowActionModal(false); 

  const navigate = useNavigate();

const StatusBadge = ({ status }) => {
  let badgeStyle = {
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff',
  };

  if (status === 'banned') {
    badgeStyle = { ...badgeStyle, backgroundColor: '#e74c3c' }; // Red for banned
    return <span style={badgeStyle}>Banned</span>;
  } else if (status === 'suspended') {
    badgeStyle = { ...badgeStyle, backgroundColor: '#f39c12' }; // Orange for suspended
    return <span style={badgeStyle}>Suspended</span>;
  } else if (status === 'both') {
    badgeStyle = { ...badgeStyle, backgroundColor: '#8e44ad' }; // Purple for both
    return <span style={badgeStyle}>Banned & Suspended</span>;
  }

  return null; 
};


  useEffect(() => {
    const fetchExecutives = async () => {
      setLoading(true); 
      try {
        const data = await getAllUsers(); 
        const userDataArray = data.user_data || []; 
        setUserstatstics(data);
        setUsers(userDataArray); // Set users state
        setFilteredUsers(userDataArray); // Store the array in filteredUsers
      } catch (err) {
        setError(err.message); // Set error message if an error occurs
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };
    
    fetchExecutives(); 
  }, []); 
  
  

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  
  if (error) {
    return <div className="text-danger">Error: {error}</div>; 
  }
  const handleSelect = (option) => {
    setSelectedOption(option);
    setShowModal(false);
  
    let filtered = [];
    if (option === "Dormant") {
      filtered = users.filter(user => user.Is_Dormant); 
    } else if (option === "Active") {
      filtered = users.filter(user => user.is_online); 
    } else if (option === "Offline") {
      filtered = users.filter(user => !user.is_online); 
    } else if (option === "All") {
      filtered = users; 
    }



    setFilteredUsers(filtered);
    setPage(1); 
  };
  

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };
  const handleSearch = () => {
    const normalizePhone = phone => phone.replace(/\D/g, ''); // Normalize phone number by removing non-numeric characters
  
    const filtered = users.filter(user => {
      const IDMatch = user.User_ID && user.User_ID.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = user.mobile_number && normalizePhone(user.mobile_number).includes(searchQuery.replace(/\D/g, '')); // Normalize and match phone number
      
      return IDMatch || phoneMatch; // Return true if either matches
    });
  
    setFilteredUsers(filtered); // Update filteredUsers with the search results
    setPage(1); // Reset to the first page when searching
  };
  
    // Calculate the indices for slicing the executives array
    const indexOfLastExecutive = page * itemsPerPage;
    const indexOfFirstExecutive = indexOfLastExecutive - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstExecutive, indexOfLastExecutive);
  
    // Total number of pages
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
    const handleToggleBan = async (userId, isBanned) => {
      try {
        const result = isBanned ? await unbanUser(userId) : await banUser(userId);
        setFilteredUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, Ban: !isBanned } : user
          )
        );
        handleCloseModal();
        toast.success(`User ${isBanned ? "unbanned" : "banned"} successfully!`);
      } catch (err) {
        console.error(`Error ${isBanned ? "unbanning" : "banning"} user:`, err.message);
        toast.error(`Error ${isBanned ? "unbanning" : "banning"} user: ${err.message}`);
      }
    };
    
    const handleToggleSuspend = async (userId, isSuspended) => {
      try {
        const result = isSuspended ? await unsuspendUser(userId) : await suspendUser(userId);
        setFilteredUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, Suspend: !isSuspended } : user
          )
        );
        handleCloseModal();
        toast.success(`User ${isSuspended ? "unsuspended" : "suspended"} successfully!`);
      } catch (err) {
        console.error(`Error ${isSuspended ? "unsuspending" : "suspending"} user:`, err.message);
        toast.error(`Error ${isSuspended ? "unsuspending" : "suspending"} user: ${err.message}`);
      }
    };
    
         
    
  return (
    <div className="container mt-4">
      <ToastContainer></ToastContainer>
      <h2 className="mb-4">Users List</h2>

      {/* Filter Controls */}
      <div className="d-flex align-items-start mb-3 gap-3 justify-content-between">
        <div className="d-flex gap-3">
          <Form.Group controlId="cashSearch" className="w-100">
            <Form.Label>Search By</Form.Label>
            <Form.Control
          type="text"
          placeholder="Search by anything"
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />          </Form.Group>
          <Form.Group>
            <Form.Label>&nbsp;</Form.Label>
            <Button onClick={handleSearch} variant="success" className="w-100">
              <FaSearch />
            </Button>
          </Form.Group>
          <Form.Group className="mb-0 me-2">
            <Form.Label>&nbsp;</Form.Label>
            <Button className="w-100 buttonsort" onClick={() => setShowModal(true)}>
              <i className="bi bi-sort-up"></i>
            </Button>
          </Form.Group>
        </div>

        {/* Right-side Card */}
        <Card className="p-2 mt-2 text-center employee-summary-card">
          <Row>
            <Col className="summary-item">
              <p>Total</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-people-fill text-primary me-2"></i>
                <span className="text-primary">{userstatstics?.total_users ?? 0}</span>
                </div>
            </Col>
            <Col className="summary-item">
              <p>Inactive</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-x-circle-fill text-danger me-2"></i>
                <span className="text-danger">{userstatstics?.inactive_users ?? 0}</span>
              </div>
            </Col>
            <Col className="summary-item">
              <p>Active</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <span className="text-success">{userstatstics?.active_users ?? 0}</span>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      <Table  hover responsive="sm" className="request-table">
  <thead>
    <tr>
      <th>User ID</th>
      <th>Date</th>
      <th>Mobile number</th>
      <th>Total Coin Spend</th>
      <th>Total Purchases</th>
      <th>Total Talktime</th>
      <th></th>
    </tr>
  </thead>
  <tbody style={{cursor:'pointer'}}>
    {currentUsers.map((user) => {
      // Determine user status
      const isBanned = user.Ban;
      const isSuspended = user.Suspend;

      let status = '';
      if (isBanned && isSuspended) {
        status = 'both';
      } else if (isBanned) {
        status = 'banned';
      } else if (isSuspended) {
        status = 'suspended';
      }

      return (
        <React.Fragment key={user["User_ID"]}>
          <tr>
            <td>
              <span onClick={() => navigate(`/userdetails/${user.id}/${user.User_ID}`)}>
                {user.User_ID}
              </span>
             <span className='ms-2'> {status && <StatusBadge status={status} />}</span>
            </td>
            <td onClick={() => navigate(`/userdetails/${user.id}/${user.User_ID}`)}>
              {user.Date}
            </td>
            <td onClick={() => navigate(`/userdetails/${user.id}/${user.User_ID}`)}>
              {user.mobile_number}
            </td>
            <td onClick={() => navigate(`/userdetails/${user.id}/${user.User_ID}`)}>
              {user.Total_Coin_Spend}
            </td>
            <td onClick={() => navigate(`/userdetails/${user.id}/${user.User_ID}`)}>
              {user.Total_Purchases}
            </td>
            <td onClick={() => navigate(`/userdetails/${user.id}/${user.User_ID}`)}>
            {user.Total_Talktime}
            
            </td>
            <td>
              <FaEllipsisV
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(user);
                }}
                style={{ cursor: 'pointer' }}
              />
            </td>
          </tr>
        </React.Fragment>
      );
    })}
  </tbody>
</Table>




      {/* Pagination */}
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
        <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <Pagination.Item
              key={pageNumber}
              active={page === pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              style={{
                backgroundColor: page === pageNumber ? '#5065F6' : 'transparent',
                color: page === pageNumber ? 'white' : '#000',
                borderRadius: '8px',
                boxShadow: page === pageNumber
                  ? '0px -1px 1px 0px #00000026 inset, 0px 2px 6px 0px #5065F642'
                  : 'none',
                transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
              }}
            >
              {pageNumber}
            </Pagination.Item>
          );
        })}
        <Pagination.Next onClick={() => setPage(page + 1)} disabled={page === totalPages} />
        <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
      </Pagination>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="sm">
  
  <Modal.Body>
    <div className="d-flex flex-column align-items-center">
      <Button variant="light" onClick={() => handleSelect('Dormant')} className="mb-2 w-100">Dormant Users</Button>
      <Button variant="light" onClick={() => handleSelect('Active')} className="mb-2 w-100">Online Users</Button>
      <Button variant="light" onClick={() => handleSelect('Offline')} className="w-100">Offline Users</Button>
      <Button variant="light" onClick={() => handleSelect('All')} className="w-100">All Users</Button>

    </div>
  </Modal.Body>
</Modal>

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

        {/* Edit Profile Button */}
        {/* <Button 
          onClick={() => navigate(`/userdetails/${selectedUser.id}`)} 
          variant="link" 
          style={{ color: 'black' }} 
          className="text-start"
        >
          <FaUserEdit className="me-2" /> Edit Profile
        </Button> */}

        {/* Toggle Suspend/Unsuspend */}
        <Button 
          variant="link" 
          style={{ color: 'black' }} 
          className="text-start"
          onClick={() => handleToggleSuspend(selectedUser.id, selectedUser.Suspend)}
        >
          <FaPhoneSlash className="me-2" /> {selectedUser.Suspend ? 'Unsuspend User' : 'Suspend User'}
        </Button>

        {/* Toggle Ban/Unban */}
        <Button 
          variant="link" 
          style={{ color: 'black' }} 
          className="text-start"
          onClick={() => handleToggleBan(selectedUser.id, selectedUser.Ban)}
        >
          <FaBan className="me-2" /> {selectedUser.Ban ? 'Unban User' : 'Ban User'}
        </Button>

      </div>
    </Modal.Body>
  </Modal>
)}





    </div>
  );
};

export default UsersList;
