import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa'; // Importing the search icon
import { Form, Button, Pagination, Table, Spinner, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import './Employee.css'; 
import { getredeemRequests } from '../services/allApi';

function Payment() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [entries, setEntries] = useState(10); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [requests, setRequests] = useState([]); // To store API data
  const [filteredRequests, setFilteredRequests] = useState([]); // Filtered requests for the current date range

  // Fetch requests when the component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getredeemRequests();
        setRequests(data); // Set the data
        setFilteredRequests(data); // Initially, set filtered data to all requests
        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        setError(error.message);
        setLoading(false); // Stop loading on error
      }
    };

    fetchRequests();
  }, []);

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}:${month}:${year}`;
  };

  // Filter requests based on date range
  const handleSearch = () => {
    const filtered = requests.filter((request) => {
      const requestDate = new Date(request.request_time);
      return requestDate >= dateFrom && requestDate <= dateTo;
    });
    setFilteredRequests(filtered);
    setPage(1); // Reset to first page after filtering
  };

  // Handle pagination logic
  const handlePageChange = (pageNumber) => setPage(pageNumber);

  // Paginate the filtered requests
  const indexOfLastRequest = page * entries;
  const indexOfFirstRequest = indexOfLastRequest - entries;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  return (
    <div className="container mt-4">
      <p className="mb-4 d-flex justify-content-between align-items-center emlist">
        Payment Request
      </p>

      <div className="d-flex align-items-start mb-3 gap-3">
        {/* Date Picker From */}
        <Form.Group controlId="datePickerFrom" className="col-md-2 d-flex flex-column">
          <Form.Label>From</Form.Label>
          <DatePicker
            selected={dateFrom}
            onChange={(date) => setDateFrom(date)}
            className="form-control"
            showTimeSelect
            dateFormat="Pp"
          />
        </Form.Group>

        {/* Date Picker To */}
        <Form.Group controlId="datePickerTo" className="col-md-2 d-flex flex-column">
          <Form.Label>To</Form.Label>
          <DatePicker
            selected={dateTo}
            onChange={(date) => setDateTo(date)}
            className="form-control"
            showTimeSelect
            dateFormat="Pp"
          />
        </Form.Group>

        {/* Search Button */}
        <Form.Group className="col-md-1 d-flex flex-column">
          <Form.Label>&nbsp;</Form.Label>
          <Button variant="success" className="w-100" onClick={handleSearch}>
            <FaSearch />
          </Button>
        </Form.Group>
      </div>

      {/* Table and Loading/Error Handling */}
      <div style={{ background: 'white', borderRadius: '10px' }}>
        <div className="d-flex justify-content-between mb-3">
          <div className="ms-4 mt-4">
            Show{' '}
            <Form.Select
              value={entries}
              onChange={(e) => setEntries(e.target.value)}
              className="d-inline w-auto"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Form.Select>{' '}
            entries
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        {/* Table with API Data */}
        {!loading && !error && (
          <Table hover responsive="sm" className="request-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>UPI Id</th>
                <th>Amount</th>
                {/* <th></th> */}
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((request, index) => (
                <tr key={index}>
                  <td>{formatDate(request.request_time)}</td>
                  <td>{request.name}</td>
                  <td>{request.upi_id}</td>
                  <td>{request.amount_requested}</td>
                  {/* <td>
                    <button className="approve">Approve</button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* No Data Message */}
        {!loading && !error && currentRequests.length === 0 && (
          <Alert variant="info" className="text-center">
            No requests found for the selected date range.
          </Alert>
        )}
      </div>

      {/* Pagination Section */}
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => handlePageChange(1)} />
        <Pagination.Prev onClick={() => handlePageChange(page > 1 ? page - 1 : 1)} />
        {[...Array(Math.ceil(filteredRequests.length / entries)).keys()].map((pageNumber) => (
          <Pagination.Item
            key={pageNumber + 1}
            active={page === pageNumber + 1}
            onClick={() => handlePageChange(pageNumber + 1)}
            style={{
              backgroundColor: page === pageNumber + 1 ? '#5065F6' : 'transparent',
              color: page === pageNumber + 1 ? 'white' : '#000',
              borderRadius: '8px',
              boxShadow: page === pageNumber + 1
                ? '0px -1px 1px 0px #00000026 inset, 0px 2px 6px 0px #5065F642'
                : 'none',
              transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
            }}
          >
            {pageNumber + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePageChange(page < Math.ceil(filteredRequests.length / entries) ? page + 1 : page)} />
        <Pagination.Last onClick={() => handlePageChange(Math.ceil(filteredRequests.length / entries))} />
      </Pagination>
    </div>
  );
}

export default Payment;
