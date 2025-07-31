import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createCoinConversion, deleteCoinConversion, editCoinConversion, getCoinConversions } from '../services/allApi';
import './coinconversion.css';

function CoinConversion() {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form state
  const [coinsEarned, setCoinsEarned] = useState('');
  const [rupees, setRupees] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Edit/Delete state
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Notification function
  const notify = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Fetch existing coin conversions
  const fetchConversions = async () => {
    setLoading(true);
    try {
      const response = await getCoinConversions();
      setConversions(response);
      console.log('Fetched conversions:', response);
    } catch (err) {
      notify('Failed to load conversion data. Please try again later.', 'error');
      console.error('Error fetching conversions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversions();
  }, []);


  const handleCloseModal = () => {
    setShowModal(false);
    setCoinsEarned('');
    setRupees('');
    setError(null);
    setEditingItem(null);
    setIsEditing(false);
  };

  // Handle modal open for add
  const handleShowModal = () => {
    setShowModal(true);
    setError(null);
    setIsEditing(false);
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setCoinsEarned(item.coins_earned.toString());
    setRupees(item.rupees.toString());
    setIsEditing(true);
    setShowModal(true);
    setError(null);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setFormSubmitting(true);
    try {
      await deleteCoinConversion(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
      notify('Conversion deleted successfully!');
      fetchConversions();
    } catch (err) {
      notify('Failed to delete conversion. Please try again.', 'error');
      console.error('Error deleting conversion:', err);
    } finally {
      setFormSubmitting(false);
    }
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
      const formattedCoins = coinsEarned;
      const formattedRupees = rupees;
      
      if (isNaN(formattedCoins) || isNaN(parseFloat(formattedRupees))) {
        throw new Error('Please enter valid numbers');
      }

      const conversionData = {
        coins_earned: formattedCoins,
        rupees: formattedRupees
      };

      if (isEditing && editingItem) {
        // Update existing conversion
        await editCoinConversion(editingItem.id, conversionData);
        notify('Conversion updated successfully!');
      } else {
        // Create new conversion
        await createCoinConversion(conversionData);
        console.log('Conversion created:', conversionData);
        notify('Conversion added successfully!');
      }
      
      handleCloseModal();
      fetchConversions();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the conversion');
      console.error('Error saving conversion:', err);
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="coin-conversion__table-body">
                    {conversions.map((item,index) => (
                      <tr key={item.id} className="coin-conversion__table-row">
                        <td className="coin-conversion__table-cell-id">{index+1}</td>
                        <td className="coin-conversion__table-cell-coins">{item.coins_earned.toLocaleString()}</td>
                        <td className="coin-conversion__table-cell-rupees">₹{parseFloat(item.rupees).toFixed(2)}</td>
                        <td className="coin-conversion__table-cell-actions">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteConfirm(item)}
                          >
                            Delete
                          </Button>
                        </td>
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

      {/* Add/Edit Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        centered
        backdrop="static"
        className="coin-conversion__modal"
      >
        <Modal.Header closeButton className="coin-conversion__modal-header">
          <Modal.Title>
            {isEditing ? 'Edit Conversion' : 'Add New Conversion'}
          </Modal.Title>
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
            ) : (isEditing ? 'Update Conversion' : 'Save Conversion')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
        className="coin-conversion__delete-modal"
      >
        <Modal.Header closeButton className="coin-conversion__modal-header">
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="coin-conversion__modal-body">
          <p>Are you sure you want to delete this conversion?</p>
          {itemToDelete && (
            <div className="coin-conversion__delete-details">
              <strong>Coins Earned:</strong> {itemToDelete.coins_earned.toLocaleString()}<br />
              <strong>Rupees:</strong> ₹{parseFloat(itemToDelete.rupees).toFixed(2)}
            </div>
          )}
          <p className="text-muted mt-2">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="coin-conversion__modal-footer">
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={formSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={formSubmitting}
          >
            {formSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Deleting...</span>
              </>
            ) : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* React Toastify Container */}
      <ToastContainer />
    </Container>
  );
}

export default CoinConversion;