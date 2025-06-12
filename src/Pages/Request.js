import React, { useEffect, useState } from 'react';
import { Table, Pagination, Image, Spinner, Modal, Button } from 'react-bootstrap';
import './Request.css';
import { getRequests } from '../services/allApi';

function Request() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [paginatedRequests, setPaginatedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null); // State to store selected request
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const perPage = 10; // Number of items per page

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getRequests(); // Fetch all requests data
        setRequests(data); // Assuming data is an array of requests
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };
  // Set paginated requests whenever the `page` or `requests` changes
  useEffect(() => {
    const indexOfLastRequest = page * perPage;
    const indexOfFirstRequest = indexOfLastRequest - perPage;
    const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
    setPaginatedRequests(currentRequests);
  }, [page, requests]);

  const handleViewClick = (request) => {
    setSelectedRequest(request); // Set the selected request
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

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

  const totalPages = Math.ceil(requests.length / perPage);

  return (
    <div className="container mt-4">
      <p className="mb-4 d-flex justify-content-between align-items-center emlist">
        Requests
      </p>

      {/* Table */}
      <Table hover responsive="sm" className="request-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Date</th>
            <th>Education</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRequests.map((item, index) => (
            <tr key={index}>
              <td>
                <Image src={item.image || 'https://via.placeholder.com/30'} roundedCircle width="30" height="30" className="me-2" />
                {item.full_name}
              </td>
              <td>{formatDate(item.created_at)}</td>
              <td>{item.education}</td>
              <td>{item.gender}</td>
              <td>
                <button className="view-button" onClick={() => handleViewClick(item)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => handlePageChange(1)} />
        <Pagination.Prev onClick={() => handlePageChange(page > 1 ? page - 1 : 1)} />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={page === index + 1}
            onClick={() => handlePageChange(index + 1)}
            style={{
              backgroundColor: page === index + 1 ? '#5065F6' : 'transparent',
              color: page === index + 1 ? 'white' : '#000',
              borderRadius: '8px',
              boxShadow: page === index + 1
                ? '0px -1px 1px 0px #00000026 inset, 0px 2px 6px 0px #5065F642'
                : 'none',
              transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
            }}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePageChange(page < totalPages ? page + 1 : totalPages)} />
        <Pagination.Last onClick={() => handlePageChange(totalPages)} />
      </Pagination>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest ? (
            <>
              <p><strong>Employee Name:</strong> {selectedRequest.full_name}</p>
              <p><strong>Date:</strong> {formatDate(selectedRequest.created_at)}</p>
              <p><strong>Education:</strong> {selectedRequest.education}</p>
              <p><strong>Gender:</strong> {selectedRequest.gender}</p>
              <p><strong>Place:</strong> {selectedRequest.place}</p>
              <p><strong>Profession:</strong> {selectedRequest.profession}</p>
              <p><strong>Phone:</strong> {selectedRequest.phone_number}</p>


            </>
          ) : (
            <p>No request selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Request;
