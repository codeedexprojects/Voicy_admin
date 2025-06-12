import React, { useState } from 'react';
import {
  Table, Form, Button, Pagination
} from 'react-bootstrap';
import { FaSearch, FaDownload } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

const UserAccount = () => {
  const [date, setDate] = useState(new Date());
  const [cashType, setCashType] = useState('Credit');
  const [entries, setEntries] = useState(100);
  const [page, setPage] = useState(3);
  const navigate = useNavigate();

  const handlePageChange = (pageNumber) => setPage(pageNumber);

  const rows = [
    { id: '534634614367', date: '27:07:2024', name: 'Anuranjith', account: 'Credit', paymentMethod: 'Gpay', amount: 1000, isDebit: false },
    { id: '534634614367', date: '27:07:2024', name: 'Anuranjith', account: 'Debit', paymentMethod: 'Gpay', amount: 1000, isDebit: true },
    // Add more rows as needed
  ];
  const handleClick = () => {
    navigate('/payment');
  };
  return (
    <div className="container mt-4" style={{padding:'0px'}}>
      <h2 className="mb-4">Accounts</h2>

      <div className="d-flex align-items-start mb-3 gap-3">
  {/* Cash Type Dropdown */}
  <Form.Group controlId="cashSelect" className="col-md-2">
    <Form.Label>Cash</Form.Label>
    <Form.Select
      value={cashType}
      onChange={(e) => setCashType(e.target.value)}
    >
      <option value="Credit">Credit</option>
      <option value="Debit">Debit</option>
    </Form.Select>
  </Form.Group>

  {/* Date Picker From */}
  <Form.Group controlId="datePickerFrom" className="col-md-2 d-flex flex-column">
    <Form.Label>From</Form.Label>
    <DatePicker
      selected={date}
      onChange={(date) => setDate(date)}
      className="form-control"
      showTimeSelect
      dateFormat="Pp"
      customInput={<Form.Control />}
    />
  </Form.Group>

  {/* Date Picker To */}
  <Form.Group controlId="datePickerTo" className="col-md-2 d-flex flex-column">
    <Form.Label>To</Form.Label>
    <DatePicker
      selected={date}
      onChange={(date) => setDate(date)}
      className="form-control"
      showTimeSelect
      dateFormat="Pp"
      customInput={<Form.Control />}
    />
  </Form.Group>

  {/* Search Button */}
  <Form.Group className="col-md-1 d-flex flex-column">
    <Form.Label>&nbsp;</Form.Label>
    <Button variant="success" className="w-100">
      <FaSearch />
    </Button>
  </Form.Group>

  {/* Right-Aligned Buttons */}
  <div className="ms-auto d-flex align-items-end">
    {/* Download Button */}
    <Form.Group className="mb-0 me-2">
      <Form.Label>&nbsp;</Form.Label>
      <button   className="w-100 buttond">
        <FaDownload />
      </button>
    </Form.Group>

    {/* Payment Request Button */}
    <Form.Group className="mb-0" >
      <Form.Label>&nbsp;</Form.Label>
      <button         onClick={handleClick}
 style={{ whiteSpace: 'nowrap',background:'#5065F6',border:'none',borderRadius:'10px',padding:'5px',color:'white' }} variant="info" className="w-100">
        <span style={{fontSize:'14px'}}>Payment Request</span>
      </button>
    </Form.Group>
  </div>
</div>








      {/* Entries Selector */}
      
      <div style={{background:'white',borderRadius:'10px',padding:'15px'}}>
      <div className="d-flex justify-content-between mb-3">
        <div>
          Show up to{' '}
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
        <Button variant="outline-secondary">        <FaDownload className='me-2'/>
        Export</Button>
      </div>

        <Table hover responsive="sm" className="request-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Name</th>
              <th>Account</th>
              <th>Payment Method</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row.id}</td>
                <td>{row.date}</td>
                <td>{row.name}</td>
                <td className={row.isDebit ? 'text-danger' : 'text-success'}>
                  {row.account}
                </td>
                <td>{row.paymentMethod}</td>
                <td className={row.isDebit ? 'text-danger' : 'text-success'}>
                  {row.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination className="justify-content-center mt-4">
      <Pagination.First />
      <Pagination.Prev />
      {[1, 2, 3].map((pageNumber) => (
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
      ))}
      <Pagination.Next />
      <Pagination.Last />
    </Pagination>
    </div>
  );
};

export default UserAccount;
