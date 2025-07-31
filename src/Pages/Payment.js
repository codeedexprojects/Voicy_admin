import React, { useState, useEffect } from 'react';
import { FaSearch, FaDownload } from 'react-icons/fa';
import { Form, Button, Pagination, Table, Spinner, Alert, Badge, Dropdown } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { toast, ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';
import './Employee.css'; 
import { getredeemRequests, updateRedemptionRequestStatus } from '../services/allApi';

function Payment() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [entries, setEntries] = useState(10); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]); 
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getredeemRequests();
        // console.log(data,"redeem")
        setRequests(data || []);
        setFilteredRequests(data || []);
        setLoading(false); 
      } catch (error) {
        setError(error.message);
        setLoading(false); 
        toast.error('Failed to fetch payment requests');
      }
    };

    fetchRequests();
  }, []);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); 
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Enhanced search function
  const handleSearch = () => {
    if (!requests || requests.length === 0) {
      setFilteredRequests([]);
      return;
    }

    let filtered = requests;

    // Filter by date range
    filtered = filtered.filter((request) => {
      if (!request?.request_time) return false;
      try {
        const requestDate = new Date(request.request_time);
        return requestDate >= dateFrom && requestDate <= dateTo;
      } catch (error) {
        return false;
      }
    });

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((request) => {
        const term = searchTerm.toLowerCase();
        return (
          request?.name?.toLowerCase().includes(term) ||
          request?.upi_id?.toLowerCase().includes(term) ||
          request?.account_number?.toLowerCase().includes(term) ||
          request?.ifsc_code?.toLowerCase().includes(term) ||
          request?.status?.toLowerCase().includes(term)
        );
      });
    }

    setFilteredRequests(filtered);
    setPage(1); 
  };

  // Excel download function
  const handleExcelDownload = () => {
    if (!filteredRequests || filteredRequests.length === 0) {
      toast.error('No data to download');
      return;
    }

    const excelData = filteredRequests.map((request, index) => ({
      'S.No': index + 1,
      'Date': formatDate(request?.request_time),
      'Name': request?.name || 'N/A',
      'Executive ID': request?.executive_id    || 'N/A',
      'UPI ID': request?.upi_id || 'N/A',
      'Amount': request?.amount_requested || '0',
      'Account Number': request?.account_number || 'N/A',
      'IFSC Code': request?.ifsc_code || 'N/A',
      'Status': request?.status || 'Unknown'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Requests');
    
    const fileName = `payment_requests_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Excel file downloaded successfully');
  };

  // Handle status update with one-time edit
  const handleStatusUpdate = async (requestId, newStatus) => {
    if (!requestId) {
      toast.error('Invalid request ID');
      return;
    }

    setUpdatingStatus(requestId);
    try {
      const statusData = { status: newStatus };
      await updateRedemptionRequestStatus(requestId, statusData);
      
      // Update local state
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus }
          : request
      );
      const updatedFilteredRequests = filteredRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus }
          : request
      );
      
      setRequests(updatedRequests);
      setFilteredRequests(updatedFilteredRequests);
      
      toast.success(`Status updated to ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handlePageChange = (pageNumber) => setPage(pageNumber);

  const indexOfLastRequest = page * entries;
  const indexOfFirstRequest = indexOfLastRequest - entries;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <p className="mb-4 d-flex justify-content-between align-items-center emlist">
            Payment Request
            <Button variant="success" onClick={handleExcelDownload} className="btn-sm">
              <FaDownload className="me-2" />
              Download Excel
            </Button>
          </p>

          <div className="row mb-3 align-items-end">
            <div className="col-md-3">
              <Form.Group controlId="searchTerm">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name, UPI, account, IFSC, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </div>
            
            <div className="col-md-2">
              <Form.Group controlId="datePickerFrom">
                <Form.Label>From</Form.Label>
                <DatePicker
                  selected={dateFrom}
                  onChange={(date) => setDateFrom(date)}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </Form.Group>
            </div>

            <div className="col-md-2">
              <Form.Group controlId="datePickerTo">
                <Form.Label>To</Form.Label>
                <DatePicker
                  selected={dateTo}
                  onChange={(date) => setDateTo(date)}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </Form.Group>
            </div>

            <div className="col-md-1">
              <Button variant="primary" onClick={handleSearch} className="w-100">
                <FaSearch />
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <div>
                  Show{' '}
                  <Form.Select
                    value={entries}
                    onChange={(e) => setEntries(Number(e.target.value))}
                    className="d-inline w-auto"
                    style={{ width: '80px' }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Form.Select>{' '}
                  entries
                </div>
                <div>
                  <small className="text-muted">
                    Showing {indexOfFirstRequest + 1} to {Math.min(indexOfLastRequest, filteredRequests.length)} of {filteredRequests.length} entries
                  </small>
                </div>
              </div>

              {loading && (
                <div className="text-center my-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}

              {error && (
                <Alert variant="danger" className="text-center">
                  {error}
                </Alert>
              )}

              {!loading && !error && (
                <div className="table-responsive">
                  <Table hover responsive="sm" className="request-table">
                    <thead >
                      <tr>
                        <th style={{ width: '10%' }}>Date</th>
                        <th style={{ width: '15%' }}>Name</th>
                        <th style={{ width: '15%' }}>Executive ID</th>
                        <th style={{ width: '15%' }}>UPI ID</th>
                        <th style={{ width: '10%' }}>Amount</th>
                        <th style={{ width: '15%' }}>Account Number</th>
                        <th style={{ width: '10%' }}>IFSC Code</th>
                        <th style={{ width: '10%' }}>Status</th>
                        <th style={{ width: '15%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequests.map((request, index) => (
                        <tr key={request?.id || index}>
                          <td>{formatDate(request?.request_time)}</td>
                          <td>{request?.name || 'N/A'}</td>
                          <td>{request?.executive_id || 'N/A'}</td>
                          <td>{request?.upi_id || 'N/A'}</td>
                          <td>₹{request?.amount_requested || '0'}</td>
                          <td>{request?.account_number || 'N/A'}</td>
                          <td>{request?.ifsc_code || 'N/A'}</td>
                          <td>
                            <Badge bg={getStatusVariant(request?.status)}>
                              {request?.status || 'Unknown'}
                            </Badge>
                          </td>
                          <td>
                            {request?.status?.toLowerCase() === 'completed' ? (
                              <span className="text-muted small">Completed</span>
                            ) : (
                              <Dropdown>
                                <Dropdown.Toggle 
                                  variant="outline-primary" 
                                  size="sm"
                                  disabled={updatingStatus === request?.id}
                                >
                                  {updatingStatus === request?.id ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    'Update '
                                  )}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                  {request?.status?.toLowerCase() !== 'processing' && (
                                    <Dropdown.Item 
                                      onClick={() => handleStatusUpdate(request?.id, 'processing')}
                                    >
                                      Mark as Processing
                                    </Dropdown.Item>
                                  )}
                                  <Dropdown.Item 
                                    onClick={() => handleStatusUpdate(request?.id, 'completed')}
                                  >
                                    Mark as Completed
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {!loading && !error && currentRequests.length === 0 && (
                <Alert variant="info" className="text-center">
                  No requests found for the selected criteria.
                </Alert>
              )}
            </div>
          </div>

          {/* Pagination */}
          {filteredRequests.length > entries && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)} 
                  disabled={page === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(page - 1)} 
                  disabled={page === 1}
                />
                
                {[...Array(Math.ceil(filteredRequests.length / entries)).keys()]
                  .filter(pageNumber => {
                    const pageNum = pageNumber + 1;
                    return pageNum === 1 || 
                           pageNum === Math.ceil(filteredRequests.length / entries) ||
                           (pageNum >= page - 2 && pageNum <= page + 2);
                  })
                  .map((pageNumber, index, array) => {
                    const pageNum = pageNumber + 1;
                    const prevPageNum = array[index - 1] ? array[index - 1] + 1 : null;
                    
                    return (
                      <React.Fragment key={pageNum}>
                        {prevPageNum && pageNum - prevPageNum > 1 && (
                          <Pagination.Ellipsis disabled />
                        )}
                        <Pagination.Item
                          active={page === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            backgroundColor: page === pageNum ? '#5065F6' : 'transparent',
                            color: page === pageNum ? 'white' : '#000',
                            borderRadius: '8px',
                            boxShadow: page === pageNum
                              ? '0px -1px 1px 0px #00000026 inset, 0px 2px 6px 0px #5065F642'
                              : 'none',
                            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
                          }}
                        >
                          {pageNum}
                        </Pagination.Item>
                      </React.Fragment>
                    );
                  })}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(page + 1)} 
                  disabled={page === Math.ceil(filteredRequests.length / entries)}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(Math.ceil(filteredRequests.length / entries))} 
                  disabled={page === Math.ceil(filteredRequests.length / entries)}
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
}

export default Payment;