import React, { useState, useEffect } from 'react';
import { getRefferalHistory } from '../services/allApi';
import { Table, Form, Spinner, Pagination } from 'react-bootstrap';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import CurrencyRupeeTwoToneIcon from '@mui/icons-material/CurrencyRupeeTwoTone';
import { FaCoins, FaSearch } from 'react-icons/fa';

function ReferralHistory() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReferralHistory = async () => {
      try {
        const data = await getRefferalHistory();
        setReferrals(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch referral history');
        setLoading(false);
        console.error(err);
      }
    };

    fetchReferralHistory();
  }, []);

 const filteredReferrals = referrals.filter(referral => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (referral.referred_user_id?.toString()?.toLowerCase()?.includes(searchLower)) ||
      (referral.referred_user_mobile?.toLowerCase()?.includes(searchLower)) ||
      (referral.referrer_user_id?.toString()?.toLowerCase()?.includes(searchLower)) ||
      (referral.referrer_mobile?.toLowerCase()?.includes(searchLower)) 
    );
  });



  // Pagination logic
  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const currentItems = filteredReferrals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container my-4">
      <h3 className="mb-4">Referral History</h3>
      
      {/* Search Bar */}
      <div className="mb-4">
        <MDBCard>
          <MDBCardBody>
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <Form.Control
                type="text"
                placeholder="Search by ID or mobile"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </MDBCardBody>
        </MDBCard>
      </div>

      {/* Referral Table */}
      <MDBCard>
        <MDBCardBody>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Referred User ID</th>
                <th>Referred Mobile</th>
                <th>Referrer ID</th>
                <th>Referrer Mobile</th>
                <th>Coins Earned</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((referral, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{referral.referred_user_id}</td>
                    <td>{referral.referred_user_mobile}</td>
                    <td>{referral.referrer_user_id}</td>
                    <td>{referral.referrer_mobile}</td>
                    <td>
                      <FaCoins fontSize="small" />
                      {referral.referral_amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    {searchTerm ? 'No matching referrals found' : 'No referral history available'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </div>
  );
}

export default ReferralHistory;