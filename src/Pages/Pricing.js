import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Dropdown,
  Modal,
  Button,
  Form,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  AddPackage,
  DeletePackage,
  EditPackage,
  getCategories,
  getPackage,
} from "../services/allApi";
import { toast, ToastContainer } from "react-toastify";

function Pricing() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [categories, setCategories] = useState([]);

  const handleShowDeleteModal = (packageId) => {
    setSelectedPackageId(packageId);
    setShowDeleteModal(true);
  };
  
  const handleDeletePackage = async () => {
    try {
      await DeletePackage(selectedPackageId);
      toast.success("Package deleted successfully!", { 
        autoClose: 2000, 
        onClose: async () => {
          await fetchPackages(); 
        }
      });
      setShowDeleteModal(false);
    } catch (error) {
      toast.error(`Error deleting package: ${error.message}`, { autoClose: 3000 });
    }
  };
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    plan_name: "",
    base_price: "",
    coin_package: "",
    discount_percentage: "",
    category_id: "",
    is_active: true, // Added is_active field
  });

  const handleShowModal = (cardId, data) => {
    setSelectedCard(cardId);
    if (cardId) {
      // Find category ID by matching the name
      const category = categories.find(cat => cat.name === data.category_name);
      setFormData({ 
        ...data, 
        category_id: category ? category.id : "",
        coin_package: data.coin_package || data.adjusted_coin_package,
        is_active: data.is_active !== undefined ? data.is_active : true // Include is_active
      });
    } else {
      setFormData({
        plan_name: "",
        base_price: "",
        adjusted_coin_package: "",
        discount_percentage: "",
        category_id: categories.length > 0 ? categories[0].id : "",
        is_active: true // Default to active for new packages
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
    setFormData({
      plan_name: "",
      base_price: "",
      coin_package: "",
      discount_percentage: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      is_active: true,
    });
  };

  const handleSaveChanges = async () => {
    try {
      if (
        !formData.plan_name ||
        !formData.coin_package ||
        !formData.base_price || 
        !formData.category_id
      ) {
        console.error("All fields are required");
        toast.error("All fields are required!");
        return;
      }

      // Validate discount percentage if provided
      if (formData.discount_percentage && 
          (isNaN(formData.discount_percentage) || 
           formData.discount_percentage < 0 || 
           formData.discount_percentage > 100)) {
        toast.error("Discount percentage must be a number between 0 and 100!");
        return;
      }

      const dataToSubmit = { ...formData }; 

      if (!dataToSubmit.discount_percentage) {
        delete dataToSubmit.discount_percentage;
      }

      if (selectedCard) {
        await EditPackage(selectedCard, dataToSubmit);
        toast.success("Package updated successfully!");
        await fetchPackages();
      } else {
        await AddPackage(dataToSubmit);
        toast.success("Package added successfully!");
        await fetchPackages();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving changes:", error.message);
      toast.error(`Error saving changes: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const packageData = await getPackage();
      console.log(packageData);
      setPackages(packageData);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-danger">Error: {error}</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end mb-3">
        <button
          style={{
            background: "#5065F6",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px",
          }}
          onClick={() =>
            handleShowModal(null, { label: "", cash: "", points: "" })
          }
        >
          <span style={{ fontSize: "14px" }}>Add New Package</span>
        </button>
      </div>

      <Row>
        {packages.map((pkg) => (
          <Col lg={3} md={6} sm={12} key={pkg.id} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex flex-column">
                    <Card.Title style={{ fontSize: "18px", marginBottom: "8px" }}>
                      {pkg.plan_name}
                    </Card.Title>
                    {/* is_active Badge */}
                    <Badge 
                      bg={pkg.is_active ? "success" : "secondary"} 
                      style={{ 
                        fontSize: "10px", 
                        width: "fit-content",
                        marginBottom: "10px" 
                      }}
                    >
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Dropdown>
                    <Dropdown.Toggle
                      as={CustomToggle}
                      id="dropdown-custom-components"
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => handleShowModal(pkg.id, pkg)}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleShowDeleteModal(pkg.id)}
                      >
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <div>
                  <Row>
                    <Col>
                      <div className="mb-2">
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#757B82",
                            marginBottom: "4px",
                          }}
                        >
                          Label
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#323343",
                            marginBottom: "0px",
                          }}
                        >
                          {pkg.discount_percentage ? `${pkg.discount_percentage}% OFF Now` : "No Discount"}
                        </p>
                      </div>
                    </Col>
                    <Col>
                      <div className="mb-2">
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#757B82",
                            marginBottom: "4px",
                          }}
                        >
                          Cash
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#323343",
                            marginBottom: "0px",
                          }}
                        >
                          {pkg.base_price}
                        </p>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#757B82",
                            marginBottom: "4px",
                          }}
                        >
                          Points
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#323343",
                            marginBottom: "0px",
                          }}
                        >
                          {pkg.adjusted_coin_package}
                        </p>
                      </div>
                    </Col>
                    <Col>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#757B82",
                            marginBottom: "4px",
                          }}
                        >
                          Category
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#323343",
                            marginBottom: "0px",
                          }}
                        >
                          {pkg.category_name}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCard ? `Edit Package ${selectedCard}` : "Add New Package"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formPlanName">
              <Form.Label style={{ fontSize: "14px", color: "#323343" }}>
                Plan Name
              </Form.Label>
              <Form.Control
                type="text"
                name="plan_name"
                value={formData.plan_name}
                onChange={handleInputChange}
                placeholder="Enter plan name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control as="select" name="category_id" value={formData.category_id} onChange={handleInputChange}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* is_active Checkbox */}
            <Form.Group className="mb-3" controlId="formIsActive">
              <Form.Check
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                label="Package is Active"
                style={{ fontSize: "14px", color: "#323343" }}
              />
              <Form.Text className="text-muted">
                Uncheck to deactivate this package
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formDiscountPercentage">
              <Form.Label style={{ fontSize: "14px", color: "#323343" }}>
                Discount Percentage (Optional)
              </Form.Label>
              <Form.Control
                type="number"
                name="discount_percentage"
                value={formData.discount_percentage || ""}
                onChange={handleInputChange}
                placeholder="Enter discount percentage (0-100)"
                min="0"
                max="100"
                step="0.01"
              />
              <Form.Text className="text-muted">
                Enter a number between 0 and 100 (e.g., 15 for 15% off)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCash">
              <Form.Label style={{ fontSize: "14px", color: "#323343" }}>
                Cash
              </Form.Label>
              <Form.Control
                type="text"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                placeholder="Enter cash value"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPoints">
              <Form.Label style={{ fontSize: "14px", color: "#323343" }}>
                Points
              </Form.Label>
              <Form.Control
                type="text"
                name="coin_package"
                value={formData.coin_package}
                onChange={handleInputChange}
                placeholder="Enter points"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button
            variant="light"
            className="mx-2"
            style={{ width: "150px" }}
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="mx-2"
            style={{
              background: "#5065F6",
              borderRadius: "10px",
              width: "150px",
            }}
            onClick={handleSaveChanges}
          >
            {selectedCard ? `Save Changes` : "Add Package"}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this package?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePackage}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer></ToastContainer>
    </div>
  );
}

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <span
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ cursor: "pointer" }}
  >
    {children}
  </span>
));

export default Pricing;