import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Form, Button, Pagination,
  Badge
} from 'react-bootstrap';
import { FaSearch, FaDownload } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAccounts } from '../services/allApi';
import * as XLSX from 'xlsx';

const UserAccount = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
    const location = useLocation();
  const [showAdminOnly, setShowAdminOnly] = useState(false);
  
  // Read the navigation state when component mounts
  useEffect(() => {
    if (location.state?.showAdminOnly) {
      setShowAdminOnly(true);
    }
  }, [location.state]);


  
  const navigate = useNavigate();

  // Fetch accounts data
  useEffect(() => {
   const fetchAccounts = async () => {
      setLoading(true);
      try {
        const data = await getAccounts();
        
        // Filter data if showAdminOnly is true
        const filteredData = showAdminOnly 
          ? data.filter(account => account.is_admin)
          : data;
          
        setAccounts(Array.isArray(filteredData) ? filteredData : []);
        setTotalRecords(Array.isArray(filteredData) ? filteredData.length : 0);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setAccounts([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [showAdminOnly]);
  

 const getPaymentStatusVariant = (status) => {
  if (!status) return 'secondary';
  
  const statusUpper = status.toString().toUpperCase();
  
  switch (statusUpper) {
    case 'SUCCESS':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
    case 'REJECTED':
      return 'danger';
    default:
      return 'secondary';
  }
};

  // Filter and search logic
  const filteredAccounts = useMemo(() => {
    let filtered = [...accounts];

    // Date filtering
    if (fromDate || toDate) {
      filtered = filtered.filter(account => {
        const accountDate = new Date(account.purchase_date);
        const from = fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)) : null;
        const to = toDate ? new Date(toDate.setHours(23, 59, 59, 999)) : null;
        
        if (from && to) {
          return accountDate >= from && accountDate <= to;
        } else if (from) {
          return accountDate >= from;
        } else if (to) {
          return accountDate <= to;
        }
        return true;
      });
    }

    // Search filtering
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(account =>
        account.user_id?.toString().toLowerCase().includes(search) ||
        account.purchase_date?.toLowerCase().includes(search) ||
        account.coins_purchased?.toString().toLowerCase().includes(search) ||
        account.base_price?.toString().toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [accounts, fromDate, toDate, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / entries);
  const startIndex = (currentPage - 1) * entries;
  const endIndex = startIndex + entries;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [entries, searchTerm, fromDate, toDate]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    // Search is handled automatically through useMemo
    // This function can be used for additional search logic if needed
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Excel download functionality
  const downloadExcel = (dataToExport = filteredAccounts) => {
    try {
      // Prepare data for Excel
      const excelData = dataToExport.map((account, index) => ({
        'S.No': index + 1,
        'User ID': account.user_id || '',
        'Date': account.purchase_date || '',
        'Coin Purchased': account.coins_purchased || '',
        'Purchased Price': account.base_price || '',
        'Payment Status': account.payment_status || '',
        'Payment Mode': account.is_admin ? 'Admin' : 'Online'  

      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 },  // S.No
        { wch: 15 }, // User ID
        { wch: 20 }, // Date
        { wch: 18 }, // Coin Purchased
        { wch: 18 }  // Purchased Price
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'User Accounts');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `user_accounts_${currentDate}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  const handleClick = () => {
    navigate('/payment');
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={currentPage === i}
          onClick={() => handlePageChange(i)}
          style={{
            backgroundColor: currentPage === i ? '#5065F6' : 'transparent',
            color: currentPage === i ? 'white' : '#000',
            borderRadius: '8px',
            boxShadow: currentPage === i
              ? '0px -1px 1px 0px #00000026 inset, 0px 2px 6px 0px #5065F642'
              : 'none',
            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
          }}
        >
          {i}
        </Pagination.Item>
      );
    }
    return items;
  };

  return (
    <div className="container mt-4" style={{ padding: '0px' }}>
      <h2 className="mb-4">Accounts</h2>

      <div className="d-flex align-items-start mb-3 gap-3">
        {/* Date Picker From */}
        <Form.Group controlId="datePickerFrom" className="col-md-2 d-flex flex-column">
          <Form.Label>From</Form.Label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            className="form-control"
            showTimeSelect
            dateFormat="Pp"
            customInput={<Form.Control />}
            placeholderText="Select start date"
            isClearable
          />
        </Form.Group>

        {/* Date Picker To */}
        <Form.Group controlId="datePickerTo" className="col-md-2 d-flex flex-column">
          <Form.Label>To</Form.Label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            className="form-control"
            showTimeSelect
            dateFormat="Pp"
            customInput={<Form.Control />}
            placeholderText="Select end date"
            isClearable
            minDate={fromDate}
          />
        </Form.Group>

        {/* Search Input */}
        <Form.Group controlId="searchInput" className="col-md-3 d-flex flex-column">
          <Form.Label>Search</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search by User ID, Date, Coins, Price..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>

        {/* Search Button */}
        <Form.Group className="col-md-1 d-flex flex-column">
          <Form.Label>&nbsp;</Form.Label>
          <Button variant="success" className="w-100" onClick={handleSearch}>
            <FaSearch />
          </Button>
        </Form.Group>

        {/* Clear Filters Button */}
        {/* <Form.Group className="col-md-1 d-flex flex-column">
          <Form.Label>&nbsp;</Form.Label>
          <Button variant="outline-secondary" className="w-100" onClick={handleClearFilters}>
            Clear
          </Button>
        </Form.Group> */}

        {/* Right-Aligned Buttons */}
        <div className="ms-auto d-flex align-items-end">
          {/* Download Button */}
          <Form.Group className="mb-0 me-2">
            <Form.Label>&nbsp;</Form.Label>
            <button 
              className="w-100 buttond"
              onClick={() => downloadExcel()}
              title="Download all filtered data"
            >
              <FaDownload />
            </button>
          </Form.Group>

          {/* Payment Request Button */}
          <Form.Group className="mb-0">
            <Form.Label>&nbsp;</Form.Label>
            <button 
              onClick={handleClick}
              style={{ 
                whiteSpace: 'nowrap',
                background: '#5065F6',
                border: 'none',
                borderRadius: '10px',
                padding: '5px',
                color: 'white' 
              }} 
              className="w-100"
            >
              <span style={{ fontSize: '14px' }}>Executive Payment Request</span>
            </button>
          </Form.Group>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-3">
        <small className="text-muted">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredAccounts.length)} of {filteredAccounts.length} entries
          {filteredAccounts.length !== totalRecords && ` (filtered from ${totalRecords} total entries)`}
        </small>
      </div>

      {/* Main Table Container */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '15px' }}>
        <div className="d-flex justify-content-between mb-3">
          <div>
            Show up to{' '}
            <Form.Select
              value={entries}
              onChange={(e) => setEntries(Number(e.target.value))}
              className="d-inline w-auto"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Form.Select>{' '}
            entries
          </div>
          <Button 
            variant="outline-secondary"
            onClick={() => downloadExcel(currentAccounts)}
            title="Export current page"
          >
            <FaDownload className='me-2'/>
            Export Current Page
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Table hover responsive="sm" className="request-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>User ID</th>
                <th>Date</th>
                <th>Payment Mode</th>
                <th>Coin Purchased</th>
                <th>Purchased Price</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {currentAccounts.length > 0 ? (
                currentAccounts.map((row, index) => (
                  <tr key={`${row.user_id}-${index}`}>
                    <td>{startIndex + index + 1}</td>
                    <td>{row.user_id || 'N/A'}</td>
                    <td>{row.purchase_date || 'N/A'}</td>
                    <td>{row.is_admin ? 'Admin' : 'Online'}</td>
                    <td>{row.coins_purchased || 'N/A'}</td>
                    <td>{row.base_price || 'N/A'}</td>
                 <td>
  <Badge 
    bg={getPaymentStatusVariant(row.payment_status)}
    style={{
      borderRadius: '6px',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500'
    }}
  >
    {row.payment_status || 'N/A'}
  </Badge>
</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    {searchTerm || fromDate || toDate ? 'No records found matching your criteria' : 'No data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.First 
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          
          {renderPaginationItems()}
          
          <Pagination.Next 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last 
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center mt-2">
          <small className="text-muted">
            Page {currentPage} of {totalPages}
          </small>
        </div>
      )}
    </div>
  );
};

export default UserAccount;