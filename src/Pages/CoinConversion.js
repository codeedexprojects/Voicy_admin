import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { createCoinConversion, getCoinConversions } from '../services/allApi';
import './coinconversion.css';

function CoinConversion() {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [coinsEarned, setCoinsEarned] = useState('');
  const [rupees, setRupees] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch existing coin conversions
  const fetchConversions = async () => {
    setLoading(true);
    try {
      const response = await getCoinConversions();
      setConversions(response);
    } catch (err) {
      showToastMessage('Failed to load conversion data. Please try again later.', 'danger');
      console.error('Error fetching conversions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversions();
  }, []);

  // Toast message helper
  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    // Reset form
    setCoinsEarned('');
    setRupees('');
    setError(null);
  };

  // Handle modal open
  const handleShowModal = () => {
    setShowModal(true);
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);

    try {
      // Validate input
      if (!coinsEarned || !rupees) {
        throw new Error('Please fill in all fields');
      }
      
      // Parse values to ensure proper format
      const formattedCoins = parseInt(coinsEarned, 10);
      const formattedRupees = parseFloat(rupees).toFixed(2);
      
      if (isNaN(formattedCoins) || isNaN(parseFloat(formattedRupees))) {
        throw new Error('Please enter valid numbers');
      }

      // Submit the data
      const newConversion = {
        coins_earned: formattedCoins,
        rupees: formattedRupees
      };
      
      await createCoinConversion(newConversion);
      
      // Close modal and reset form
      handleCloseModal();
      
      // Show success toast
      showToastMessage('Conversion added successfully!');
      
      // Refresh the data
      fetchConversions();
    } catch (err) {
      setError(err.message || 'An error occurred while adding the conversion');
      console.error('Error adding conversion:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <Container className="coin-conversion__container py-4">
      <h1 className="coin-conversion__title text-center mb-4">Coin Conversion System</h1>
      
      {/* Add Conversion Button */}
      <Row className="mb-4">
        <Col className="d-flex justify-content-end">
          <Button 
            variant="primary" 
            className="coin-conversion__add-btn"
            onClick={handleShowModal}
          >
            <i className="coin-conversion__add-icon">+</i> Add New Conversion
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="coin-conversion__table-card">
            <Card.Header as="h5" className="coin-conversion__table-header">Conversion History</Card.Header>
            <Card.Body className="coin-conversion__table-body">
              {loading ? (
                <div className="text-center py-4 coin-conversion__loading-container">
                  <Spinner animation="border" role="status" className="coin-conversion__loading-spinner">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : conversions.length > 0 ? (
                <Table striped bordered hover responsive className="coin-conversion__table">
                  <thead className="coin-conversion__table-head">
                    <tr>
                      <th>SI NO</th>
                      <th>Coins Earned</th>
                      <th>Rupees</th>
                    </tr>
                  </thead>
                  <tbody className="coin-conversion__table-body">
                    {conversions.map((item) => (
                      <tr key={item.id} className="coin-conversion__table-row">
                        <td className="coin-conversion__table-cell-id">{item.id}</td>
                        <td className="coin-conversion__table-cell-coins">{item.coins_earned.toLocaleString()}</td>
                        <td className="coin-conversion__table-cell-rupees">₹{parseFloat(item.rupees).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" className="coin-conversion__no-data-alert">
                  No conversion data available. Click the "Add New Conversion" button to get started.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Conversion Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        centered
        backdrop="static"
        className="coin-conversion__modal"
      >
        <Modal.Header closeButton className="coin-conversion__modal-header">
          <Modal.Title>Add New Conversion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="coin-conversion__modal-body">
          {error && <Alert variant="danger" className="coin-conversion__alert-error">{error}</Alert>}
          
          <Form onSubmit={handleSubmit} className="coin-conversion__form">
            <Form.Group className="mb-3 coin-conversion__form-group">
              <Form.Label className="coin-conversion__form-label">Coins Earned</Form.Label>
              <Form.Control
                className="coin-conversion__input-coins"
                type="number"
                placeholder="Enter coins amount"
                value={coinsEarned}
                onChange={(e) => setCoinsEarned(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3 coin-conversion__form-group">
              <Form.Label className="coin-conversion__form-label">Rupees</Form.Label>
              <Form.Control
                className="coin-conversion__input-rupees"
                type="number"
                step="0.01"
                placeholder="Enter rupees amount"
                value={rupees}
                onChange={(e) => setRupees(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="coin-conversion__modal-footer">
          <Button 
            variant="secondary" 
            onClick={handleCloseModal}
            className="coin-conversion__cancel-btn"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            className="coin-conversion__submit-btn"
            disabled={formSubmitting}
          >
            {formSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="coin-conversion__spinner" />
                <span className="ms-2">Processing...</span>
              </>
            ) : 'Save Conversion'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer 
        position="bottom-end" 
        className="p-3 coin-conversion__toast-container"
      >
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
          bg={toastVariant}
          className="coin-conversion__toast"
        >
          <Toast.Header className="coin-conversion__toast-header">
            <strong className="me-auto">Coin Conversion</strong>
          </Toast.Header>
          <Toast.Body className={`coin-conversion__toast-body ${toastVariant === 'danger' || toastVariant === 'dark' ? 'text-white' : ''}`}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

export default CoinConversion;

