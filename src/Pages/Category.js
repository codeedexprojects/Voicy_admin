import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Card, Row, Col, Spinner, Dropdown } from "react-bootstrap";
import { FaEllipsisV, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { addCategory, deleteCategory, editcategory, getCategories } from "../services/allApi";
import { toast, ToastContainer } from 'react-toastify';
function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await addCategory({ name: newCategory.trim(), is_active: true });
      fetchCategories();
      setNewCategory("");
      setShowModal(false);
      toast.success("Category added successfully!");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditIsActive(category.is_active);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await editcategory(editingCategory.id, { 
        name: editCategoryName.trim(),
        is_active: editIsActive 
      });
      fetchCategories();
      setShowEditModal(false);
      setEditingCategory(null);
      setEditCategoryName("");
      toast.success("Category updated successfully!");
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = (category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      await deleteCategory(deletingCategory.id);
      fetchCategories();
      setShowDeleteModal(false);
      setDeletingCategory(null);
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const resetAddModal = () => {
    setNewCategory("");
    setShowModal(false);
  };

  const resetEditModal = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setShowEditModal(false);
  };

  const resetDeleteModal = () => {
    setDeletingCategory(null);
    setShowDeleteModal(false);
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Add Category
        </Button>
      </div>

      {/* Statistics Card */}
      <div className="d-flex justify-content-end mb-3">
        <Card className="p-2 text-center employee-summary-card">
          <Row>
            <Col className="summary-item">
              <p>Total Categories</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-tags-fill text-primary me-2"></i>
                <span className="text-primary">{categories.length}</span>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {categories.length === 0 ? (
        <Card className="text-center p-5">
          <i className="bi bi-tags text-muted" style={{fontSize: '4rem'}}></i>
          <h4 className="text-muted mt-3">No Categories</h4>
          <p className="text-muted">There are currently no categories in the system.</p>
        </Card>
      ) : (
        <Table hover responsive="sm" className="request-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Created At</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody style={{cursor:'pointer'}}>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{new Date(category.created_at).toLocaleString()}</td>
                <td>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: category.is_active ? '#28a745' : '#dc3545'
                  }}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="link" id={`dropdown-${category.id}`} className="p-0 border-0 bg-transparent">
                      <FaEllipsisV />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEditCategory(category)}>
                        <FaEdit className="me-2" />
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleDeleteCategory(category)}
                        className="text-danger"
                      >
                        <FaTrash className="me-2" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add Category Modal */}
      <Modal show={showModal} onHide={resetAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="categoryName">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetAddModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCategory}>
            Add Category
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={resetEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editCategoryName" className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory()}
              />
            </Form.Group>
            <Form.Group controlId="editIsActive">
              <Form.Check
                type="switch"
                label="Active Status"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateCategory}>
            Update Category
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={resetDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FaTrash className="me-2" />
            Delete Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3">
              <i className="bi bi-exclamation-triangle-fill text-warning" style={{fontSize: '3rem'}}></i>
            </div>
            <h5>Are you sure you want to delete this category?</h5>
            <p className="text-muted">
              Category: <strong>"{deletingCategory?.name}"</strong>
            </p>
            <p className="text-danger small">
              This action cannot be undone and may affect related data.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteCategory}>
            <FaTrash className="me-2" />
            Delete Category
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer></ToastContainer>
    </div>
  );
}

export default Category;
