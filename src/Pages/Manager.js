import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, Modal, Form, Pagination } from "react-bootstrap";
import { AddManager, deleteManager, getManagers } from "../services/allApi";
import { FaUserTie,  FaPlus, FaTrash, FaEnvelope, FaPhone } from "react-icons/fa";
import "./manager.css";
import { toast, ToastContainer } from "react-toastify";

function Manager() {
  const [managerData, setManagerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  
  const handleDeleteClick = (manager) => {
    setManagerToDelete(manager);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!managerToDelete) return;
    try {
      await deleteManager(managerToDelete.id); 
      setManagerData(managerData.filter((m) => m.id !== managerToDelete.id));
      toast.success("Manager deleted successfully");
    } catch (err) {
      toast.error("Failed to delete manager");
    } finally {
      setShowDeleteModal(false);
      setManagerToDelete(null);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    setLoading(true);
    try {
      const data = await getManagers();
      // console.log("manager",data);
      
      setManagerData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Filtered and paginated data
  const filteredManagers = managerData.filter((manager) =>
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentManagers = filteredManagers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAdd = async (newManager) => {
    try {
      // console.log("Sending data:", newManager); 
      const response = await AddManager(newManager);
      // console.log("API Response:", response); 
      fetchManagerData();
      setShowAddModal(false);
      toast.success("Manager added successfully");
    } catch (err) {
      console.error(
        "Error adding manager:",
        err.response ? err.response.data : err
      );
      toast.error("Failed to add manager");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error)
    return <p className="text-center mt-4 text-danger">Error: {error}</p>;

  return (
    <>
     <div className="d-flex justify-content-between align-items-center px-3">
        <h4>Managers</h4>
        <div className="d-flex">
          <Form.Control
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={handleSearch}
            className="me-2"
          />
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Manager
          </Button>
        </div>
      </div>
      <Row className="justify-content-start mt-4 px-3">
        {currentManagers.map((manager) => (
          <Col key={manager.id} xs={12} sm={6} md={4} lg={4} className="mb-4">
            <Card className="manager-card shadow-sm border-0 text-center h-100 position-relative">
              {/* Delete Button Positioned on Top Right */}
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 m-2 rounded-circle p-2"
                onClick={() => handleDeleteClick(manager)}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaTrash size={14} />
              </Button>

              <Card.Body>
                <div className="manager-icon">
                  <FaUserTie size={50} className="text-primary" />
                </div>
                <h6 className="mt-3">{manager.name}</h6>
                <p className="text-muted">{manager.role}</p>
                <hr />
                <div className="d-flex align-items-center justify-content-start gap-2 text-muted small mt-2">
                  <FaEnvelope className="text-primary" size={16} />
                  <span className="fw-medium">{manager.email}</span>
                </div>
                {manager.mobile_number && (
                  <div className="d-flex align-items-center justify-content-start gap-2 text-muted small mt-2">
                    <FaPhone className="text-primary" size={16} />
                    <span className="fw-medium">{manager.mobile_number}</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <AddManagerModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleAdd={handleAdd}
      />
    
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          {[...Array(Math.ceil(filteredManagers.length / itemsPerPage)).keys()].map((number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => paginate(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{managerToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function AddManagerModal({ show, handleClose, handleAdd }) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    mobile_number: "",
    is_staff: true,
    is_active: true,
    is_superuser: false,
    role: "manager_executive",
  });

  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: "hr_executive", label: "HR" },
    { value: "manager_executive", label: "Manager" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile_number.replace(/\D/g, ''))) {
      newErrors.mobile_number = "Mobile number must be 10 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAdd(formData);
      // Reset form after successful submission
      setFormData({
        email: "",
        name: "",
        password: "",
        mobile_number: "",
        is_staff: true,
        is_active: true,
        is_superuser: false,
        role: "manager_executive",
      });
      setErrors({});
    }
  };

  const handleModalClose = () => {
    // Reset form and errors when modal closes
    setFormData({
      email: "",
      name: "",
      password: "",
      mobile_number: "",
      is_staff: true,
      is_active: true,
      is_superuser: false,
      role: "manager_executive",
    });
    setErrors({});
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Manager</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
              placeholder="Enter full name"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              placeholder="Enter email address"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Mobile Number <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="tel" 
              name="mobile_number" 
              value={formData.mobile_number}
              onChange={handleChange}
              isInvalid={!!errors.mobile_number}
              placeholder="Enter 10-digit mobile number"
            />
            <Form.Control.Feedback type="invalid">
              {errors.mobile_number}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Role <span className="text-danger">*</span></Form.Label>
            <Form.Select 
              name="role" 
              value={formData.role}
              onChange={handleChange}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Password <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              placeholder="Enter password (min 6 characters)"
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add Manager
        </Button>
      </Modal.Footer>
      <ToastContainer></ToastContainer>
    </Modal>
  );
}

export default Manager;