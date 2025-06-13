import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, Modal, Form, Pagination } from "react-bootstrap";
import { AddManager, deleteManager, getManagers } from "../services/allApi";
import { FaUserTie,  FaPlus, FaTrash, FaEnvelope } from "react-icons/fa";
import "./manager.css";
import { toast } from "react-toastify";

function Manager() {
  const [managerData, setManagerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  //   const [showEditModal, setShowEditModal] = useState(false);
  //   const [selectedManager, setSelectedManager] = useState(null);
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
      await deleteManager(managerToDelete.id); // Assume deleteManager API call
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
      console.log("manager",data);
      
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
      console.log("Sending data:", newManager); 
      const response = await AddManager(newManager);
      console.log("API Response:", response); 
      fetchManagerData();
      setShowAddModal(false);
    } catch (err) {
      console.error(
        "Error adding manager:",
        err.response ? err.response.data : err
      );
    }
  };

  //   const handleEdit = async (updatedManager) => {
  //     try {
  //       await updateManager(updatedManager.id, updatedManager);
  //       fetchManagerData();
  //       setShowEditModal(false);
  //     } catch (err) {
  //       console.error("Error updating manager:", err);
  //     }
  //   };

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
      {/* {selectedManager && (
        <EditManagerModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          handleEdit={handleEdit}
          manager={selectedManager}
        />
      )} */}
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
      </div>
    </>
  );
}


function AddManagerModal({ show, handleClose, handleAdd }) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    is_staff: true,
    is_active: true,
    is_superuser: false,
    role: "manager_executive",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    handleAdd(formData);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Manager</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              onChange={handleChange}
            />
          </Form.Group>
          {/* <Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Control as="select" name="role" onChange={handleChange}>
              <option value="manager_executive">Manager Executive</option>
              <option value="manager_user">Manager User</option>{" "}
            </Form.Control>
          </Form.Group> */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// function EditManagerModal({ show, handleClose, handleEdit, manager }) {
//   const [formData, setFormData] = useState(manager);

//   useEffect(() => {
//     setFormData(manager);
//   }, [manager]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     handleEdit(formData);
//   };

//   return (
//     <Modal show={show} onHide={handleClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>Edit Manager</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Email</Form.Label>
//             <Form.Control type="email" name="email" value={formData.email} disabled />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Role</Form.Label>
//             <Form.Control as="select" name="role" value={formData.role} onChange={handleChange}>
//               <option value="manager_executive">Manager Executive</option>
//               <option value="admin">Admin</option>
//             </Form.Control>
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>Cancel</Button>
//         <Button variant="primary" onClick={handleSubmit}>Save</Button>
//       </Modal.Footer>
//     </Modal>
//   );
// }

export default Manager;
