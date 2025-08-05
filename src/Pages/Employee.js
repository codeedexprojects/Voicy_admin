import React, { useEffect, useState } from "react";
import {
  FaBan,
  FaDownload,
  FaEllipsisV,
  FaPhoneSlash,
  FaPlus,
  FaSearch,
  FaUserCheck,
  FaUserEdit,
} from "react-icons/fa";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Pagination,
  Modal,
  Spinner,
} from "react-bootstrap";
import "./Employee.css";
import {
  banExecutive,
  getAllExecutives,
  getExecutiveStatistics,
  offlineExecutive,
  onlineExecutive,
  suspendExecutive,
  unbanExecutive,
  unsuspendExecutive,
  profileRequest,
  approveandrejectprofile,
} from "../services/allApi";
import { useNavigate } from "react-router-dom";
import AddExecutive from "./AddExecutive";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";

function Employee() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [status, setstatus] = useState(null);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExecutives, setFilteredExecutives] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [showexecutivemodal, setShowExecutiveModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  // const [selectedOption, setSelectedOption] = useState('');
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExecutives = filteredExecutives.slice(startIndex, endIndex);
  const [filterType, setFilterType] = useState("all"); // Default to show all
  const [dropdownFilter, setDropdownFilter] = useState("All"); // For Dropdown
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  const [avatarRequests, setAvatarRequests] = useState([]);

  // useEffect(() => {
  //   const fetchAvatarRequests = async () => {
  //     try {
  //       const requestStatuses = await Promise.all(
  //         paginatedExecutives.map(async (executive) => {
  //           const data = await profileRequest(executive.executive_id);
  //           console.log("profiles",data);
  //           return data.profile_photo_url === "waiting for approval" ? executive.executive_id : null;
  //         })
  //       );

  //       // Filter out null values and set avatar requests
  //       setAvatarRequests(requestStatuses.filter(Boolean));
  //     } catch (error) {
  //       console.error("Error fetching profile requests:", error.message);
  //     }
  //   };
  //   if (paginatedExecutives.length > 0) {
  //     fetchAvatarRequests();
  //   }
  // }, [paginatedExecutives]);

  const handleAvatarClick = async (executive) => {
    try {
      const requestDetails = await profileRequest(executive.executive_id);

      if (requestDetails && requestDetails.profile_photo_url) {
        setSelectedExecutive({
          ...executive,
          profile_photo_url: requestDetails.profile_photo_url,
          error: null, // Clear any previous error
        });
      } else {
        setSelectedExecutive({
          ...executive,
          profile_photo_url: null, // Clear any previous photo
          error: "No pending profile picture found for the given executive.", // Set error
        });
      }
      setShowRequestModal(true); // Always show the modal
    } catch (error) {
      console.error("Error handling avatar click:", error);
      setSelectedExecutive({
        ...executive,
        profile_photo_url: null,
        error: "Failed to fetch update request. Please try again.", // Generic error message
      });
      setShowRequestModal(true); // Always show the modal
    }
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setSelectedExecutive(null);
  };

  const handleApprove = async (id) => {
    try {
      const formData = new FormData();
      formData.append("status", "approved");

      const response = await approveandrejectprofile(id, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("Approve Response:", response);

      if (response.status === "approved") {
        toast.success(
          response.detail || "Profile request approved successfully!"
        );
        setShowRequestModal(false);
      } else {
        toast.error(
          response.detail || "Failed to approve the profile request."
        );
      }
    } catch (error) {
      console.error("Error approving profile request:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while approving the request."
      );
    }
  };

  const handleDecline = async (id) => {
    try {
      const formData = new FormData();
      formData.append("status", "rejected");

      const response = await approveandrejectprofile(id, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("Decline Response:", response);

      if (response.status === "rejected") {
        toast.success(
          response.detail || "Profile request declined successfully!"
        );
        setShowRequestModal(false);
      } else {
        toast.error(
          response.detail || "Failed to decline the profile request."
        );
      }
    } catch (error) {
      console.error("Error declining profile request:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while declining the request."
      );
    }
  };

  const totalPages = Math.ceil(filteredExecutives.length / itemsPerPage);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const data = await getAllExecutives(); 
        console.log("all executives", data);

        // Filter for executives with a "waiting for approval" profile
        const requestIds = data
          .filter(
            (executive) =>
              executive.profile_photo_url === "waiting for approval"
          )
          .map((executive) => executive.executive_id);

        setAvatarRequests(requestIds); // Set for badge display
        setExecutives(data);
        setFilteredExecutives(data);

        const status = await getExecutiveStatistics(); // Additional stats if needed
        setstatus(status);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExecutives();
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
  const handleShowModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };
  const handleSelect = (type) => {
    let filteredData;

    switch (type) {
      case "banned":
        filteredData = executives.filter((exec) => exec.is_banned);
        break;
      case "unbanned":
        filteredData = executives.filter((exec) => !exec.is_banned);
        break;
      case "Active":
        filteredData = executives.filter((exec) => exec.online);
        break;
      case "Inactive":
        filteredData = executives.filter((exec) => !exec.online);
        break;
      case "Online":
        filteredData = executives.filter((exec) => exec.online);
        break;
      case "Offline":
        filteredData = executives.filter((exec) => !exec.online);
        break;
      default:
        filteredData = executives; // Show all
        break;
    }

    setFilteredExecutives(filteredData);
    setFilterType(type); // Update the active filter
    handleCloseModal(); // Close the modal after selecting a filter
  };

  const handleDropdownSelect = (type) => {
    let filteredData;

    switch (type) {
      case "Online":
        filteredData = executives.filter((exec) => exec.online);
        break;
      case "Offline":
        filteredData = executives.filter((exec) => !exec.online);
        break;
      default:
        filteredData = executives; // Show all
        break;
    }

    setFilteredExecutives(filteredData);
    setDropdownFilter(type); // Update dropdown filter label
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowActionModal(false);
    setSelectedEmployee(null);
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handleSearch = () => {
    const filtered = executives.filter((executive) => {
      const normalizePhone = (phone) => phone.replace(/\D/g, ""); // Remove non-numeric characters

      const nameMatch =
        executive.name &&
        executive.name.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch =
        executive.mobile_number &&
        normalizePhone(executive.mobile_number).includes(searchQuery);
      const emailMatch =
        executive.email_id &&
        executive.email_id.toLowerCase().includes(searchQuery.toLowerCase());
      const professionMatch =
        executive.profession &&
        executive.profession.toLowerCase().includes(searchQuery.toLowerCase());
      const genderMatch =
        executive.gender &&
        executive.gender.toLowerCase().includes(searchQuery.toLowerCase());
  const idMatch =
        executive.executive_id &&
        executive.executive_id.toLowerCase().includes(searchQuery.toLowerCase());
      return (
        nameMatch || phoneMatch || emailMatch || professionMatch || genderMatch  || idMatch
      );
    });

    setFilteredExecutives(filtered); // Update filteredExecutives with the search results
    setPage(1); // Reset to the first page when searching
  };

  const handleNavigate = () => {
    navigate("/requests");
  };
  const handleCardClick = (id) => {
    navigate(`/empdetails/${id}`);
  };

  const handleBanExecutive = async (executiveId) => {
    try {
      const result = await banExecutive(executiveId);
      // Update the filteredExecutives to reflect the banned status
      setFilteredExecutives((prevExecutives) =>
        prevExecutives.map((executive) =>
          executive.executive_id === executiveId
            ? { ...executive, is_banned: true }
            : executive
        )
      );
      handleCloseModal();
      // console.log("Executive banned successfully:", result);
      // console.log("Executive banned successfully:", result);

      // Show success toast
      toast.success("Executive banned successfully!");
    } catch (err) {
      // console.error("Error banning executive:", err.message);

      // Show error toast
      toast.error("Error banning executive: " + err.message);
    }
  };

  const handleUnbanExecutive = async (executiveId) => {
    try {
      const result = await unbanExecutive(executiveId);
      // Update the filteredExecutives to reflect the unbanned status
      setFilteredExecutives((prevExecutives) =>
        prevExecutives.map((executive) =>
          executive.executive_id === executiveId
            ? { ...executive, is_banned: false }
            : executive
        )
      );
      handleCloseModal();
      // console.log("Executive unbanned successfully:", result);

      // Show success toast
      toast.success("Executive unbanned successfully!");
    } catch (err) {
      console.error("Error unbanning executive:", err.message);

      // Show error toast
      toast.error("Error unbanning executive: " + err.message);
    }
  };
  const handleonlineExecutive = async (executiveId) => {
    try {
      const result = await onlineExecutive(executiveId);
      // Update the filteredExecutives immediately and reapply the filter
      setFilteredExecutives((prevExecutives) => {
        const updatedExecutives = prevExecutives.map((executive) =>
          executive.id === executiveId
            ? { ...executive, online: true }
            : executive
        );
        handleDropdownSelect(dropdownFilter); // Reapply the filter after updating the state
        return updatedExecutives;
      });

      handleCloseModal();
      // console.log("Executive online successfully:", result);
      toast.success("Executive set online successfully!");
    } catch (err) {
      console.error("Error setting executive online:", err.message);
      toast.error("Error setting executive online: " + err.message);
    }
  };

  const handleofflineExecutive = async (executiveId) => {
    try {
      const result = await offlineExecutive(executiveId);
      // Update the filteredExecutives immediately and reapply the filter
      setFilteredExecutives((prevExecutives) => {
        const updatedExecutives = prevExecutives.map((executive) =>
          executive.id === executiveId
            ? { ...executive, online: false }
            : executive
        );
        handleDropdownSelect(dropdownFilter); // Reapply the filter after updating the state
        return updatedExecutives;
      });

      handleCloseModal();
      // console.log("Executive offline successfully:", result);
      toast.success("Executive set offline successfully!");
    } catch (err) {
      console.error("Error setting executive offline:", err.message);
      toast.error("Error setting executive offline: " + err.message);
    }
  };

  const handleSuspendExecutive = async (executiveId) => {
    try {
      const result = await suspendExecutive(executiveId);
      // Update the filteredExecutives to reflect the banned status
      setFilteredExecutives((prevExecutives) =>
        prevExecutives.map((executive) =>
          executive.id === executiveId
            ? { ...executive, is_suspended: true }
            : executive
        )
      );
      handleCloseModal();
      // console.log("Executive suspended successfully:", result);

      // Show success toast
      toast.success("Executive Suspended successfully!");
    } catch (err) {
      console.error("Error Suspended executive:", err.message);

      // Show error toast
      toast.error("Error Suspending executive: " + err.message);
    }
  };

  const handleUnSuspendExecutive = async (executiveId) => {
    try {
      const result = await unsuspendExecutive(executiveId);
      // Update the filteredExecutives to reflect the unbanned status
      setFilteredExecutives((prevExecutives) =>
        prevExecutives.map((executive) =>
          executive.id === executiveId
            ? { ...executive, is_suspended: false }
            : executive
        )
      );
      handleCloseModal();
      // console.log("Executive unSuspended successfully:", result);

      // Show success toast
      toast.success("Executive unSuspended successfully!");
    } catch (err) {
      console.error("Error unSuspended executive:", err.message);

      // Show error toast
      toast.error("Error unSuspending executive: " + err.message);
    }
  };
  const handleDownloadExcel = () => {
    // Prepare data for Excel
    const data = filteredExecutives.map((executive) => ({
      Name: executive.name,
      Phone: executive.mobile_number,
      Email: executive.email_id,
      Profession: executive.profession,
      Gender: executive.gender,
      Status: executive.status === "active" ? "Active" : "Inactive",
      Suspended: executive.is_suspended ? "Yes" : "No",
      Banned: executive.is_banned ? "Yes" : "No",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Executives");

    // Trigger download of the workbook
    XLSX.writeFile(wb, "executives.xlsx");
  };

  return (
    <div className="container mt-4">
      <p className="mb-4 d-flex justify-content-between align-items-center emlist">
        Executive List
        <button
          className="d-flex align-items-center addnew"
          onClick={handleNavigate}
        >
          Requests
        </button>
        <button
          className="d-flex align-items-center addnew"
          onClick={() => setShowExecutiveModal(true)}
        >
          <FaPlus className="me-2" /> New Employee
        </button>
      </p>

      <div className="d-flex align-items-start mb-3 gap-3 justify-content-between">
        <div className="d-flex gap-3">
          <Form.Group controlId="cashSearch" className="w-100">
            <Form.Label>Search By</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by anything"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </Form.Group>
        
          <Form.Group>
            <Form.Label>&nbsp;</Form.Label>
            <Button onClick={handleSearch} variant="success" className="w-100">
              <FaSearch />
            </Button>
          </Form.Group>
        </div>

        <Form.Group className="ms-auto">
          <Form.Label>&nbsp;</Form.Label>
          <button className="w-100 buttond" onClick={handleDownloadExcel}>
            <FaDownload />
          </button>
        </Form.Group>
        <Form.Group className="mb-0 me-2">
          <Form.Label>&nbsp;</Form.Label>
          <button
            onClick={() => setShowActionModal(true)}
            className="w-100 buttonsort"
          >
            <i class="bi bi-sort-up"></i>{" "}
          </button>
        </Form.Group>

        {/* Right-side Card */}
        <Card className="p-2  mt-2 text-center employee-summary-card">
          <Row>
            <Col className="summary-item">
              <p>Total</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-people-fill text-primary me-2"></i>
                <span className="text-primary">{status.total_executives}</span>
              </div>
            </Col>
            <Col className="summary-item">
              <p>Inactive</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-x-circle-fill text-danger me-2"></i>
                <span className="text-danger">
                  {status.inactive_executives}
                </span>
              </div>
            </Col>
            <Col className="summary-item">
              <p>Active</p>
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <span className="text-success">{status.active_executives}</span>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      <Row>
        {paginatedExecutives.map((executive) => (
          <Col key={executive.id} xs={12} sm={6} md={6} lg={3} className="mt-4">
            <Card
              onClick={() => handleCardClick(executive.id)}
              className={`employee-card h-100 border-0 shadow-sm ${
                executive.is_banned || executive.is_suspended
                  ? "inactive-card"
                  : ""
              }`}
              style={{
                opacity:
                  executive.is_banned || executive.is_suspended ? 0.6 : 1,
                border: executive.online ? "2px solid green" : "2px solid gray",
              }}
            >
             <div className="d-flex justify-content-between align-items-center p-2 position-relative">
  <div className="badge-container">
    {executive.is_banned && (
      <span className="badge bg-danger me-2">Banned</span>
    )}
    {executive.is_suspended && (
      <span className="badge bg-warning">Suspended</span>
    )}
    <span
      className={`badge ${
        executive.online ? "bg-success" : "bg-secondary"
      } ms-2`}
    >
      {executive.on_call ? "Oncall" : executive.online ? "Online" : "Offline"}
    </span>
  </div>
  <FaEllipsisV
    className="text-muted"
    style={{ cursor: "pointer" }}
    onClick={(e) => {
      e.stopPropagation();
      handleShowModal(executive);
    }}
  />
</div>
              <div
                className="card-header d-flex justify-content-start align-items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAvatarClick(executive);
                }}
              >
                <div className="position-relative">
                  <img
                    src={
                      executive.img ||
                      "https://i.postimg.cc/Y9LvbvTZ/Avatar.png"
                    }
                    alt={executive.name}
                    className="employee-img-rectangle"
                  />

                  {avatarRequests.includes(executive.executive_id) && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "10px" }}
                    >
                      !
                    </span>
                  )}

                  {executive.has_update_request && (
                    <span className="badge bg-info position-absolute top-0 start-0">
                      Request
                    </span>
                  )}
                </div>
                <div className="d-flex flex-column align-items-start ms-2">
                  <p className="employee-name mb-0">{executive.name}</p>
                  <p className="text-muted small">
                    {executive.coins_per_second} Coin/Sec
                  </p>
                </div>
              </div>

              <Card.Body
                style={{
                  padding: "13px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
                className="d-flex flex-column custom-scroll"
              >
                <div className="d-flex justify-content-between">
                  <div className="employee-details">
                    <p className="mb-1 employee-phone">
                      <strong>Phone</strong>
                    </p>
                    <p
                      style={{ whiteSpace: "nowrap" }}
                      className="text-muted mb-3"
                    >
                      {executive.mobile_number || "N/A"}
                    </p>

                    <p className="mb-1 employee-email">
                      <strong>Email</strong>
                    </p>
                    <p
                      style={{ whiteSpace: "nowrap" }}
                      className="text-muted mb-3"
                    >
                      {executive.email_id || "N/A"}
                    </p>
                  </div>
                  <div className="employee-info">
                    <p className="mb-1 employee-profession">
                      <strong>Profession</strong>
                    </p>
                    <p
                      style={{ whiteSpace: "nowrap" }}
                      className="text-muted mb-3"
                    >
                      {executive.profession || "N/A"}
                    </p>

                    <p className="mb-1 employee-gender">
                      <strong>Gender</strong>
                    </p>
                    <p
                      style={{ whiteSpace: "nowrap" }}
                      className="text-muted mb-3"
                    >
                      {executive.gender || "N/A"}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal for Request Approval */}
      <Modal show={showRequestModal} onHide={handleCloseRequestModal}>
        <Modal.Header closeButton>
          <Modal.Title>Image Update Request</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedExecutive?.profile_photo_url ? (
            <img
              src={selectedExecutive.profile_photo_url}
              alt="Requested Avatar"
              className="img-fluid"
            />
          ) : selectedExecutive?.error ? (
            <p className="text-danger">There is no requested image</p>
          ) : (
            <p>No requested image available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedExecutive?.profile_photo_url && (
            <>
              <Button
                variant="success"
                onClick={() => handleApprove(selectedExecutive.executive_id)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDecline(selectedExecutive.executive_id)}
              >
                Decline
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal
        show={showexecutivemodal}
        onHide={() => setShowExecutiveModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Executive</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Pass setShowExecutiveModal as a prop */}
          <AddExecutive setShowExecutiveModal={setShowExecutiveModal} />
        </Modal.Body>
      </Modal>

      {/* Modal for actions */}
      {selectedEmployee && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          dialogClassName="custom-modal-width"
          style={{
            width: "25%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Modal.Body>
            <div className="d-flex flex-column">
              <Button
                onClick={() => handleCardClick(selectedEmployee.id)}
                variant="link"
                style={{ color: "black" }}
                className="text-start"
              >
                <FaUserEdit className="me-2" /> Edit Profile
              </Button>

              {selectedEmployee.is_suspended ? (
                <Button
                  variant="link"
                  style={{ color: "black" }}
                  className="text-start"
                  onClick={() => handleUnSuspendExecutive(selectedEmployee.id)}
                >
                  <FaUserCheck className="me-2" /> Unsuspend Employee
                </Button>
              ) : (
                <Button
                  variant="link"
                  style={{ color: "black" }}
                  className="text-start"
                  onClick={() => handleSuspendExecutive(selectedEmployee.id)}
                >
                  <FaPhoneSlash className="me-2" /> Suspend Employee
                </Button>
              )}

              {/* Dynamically switch between Ban and Unban actions */}
              {selectedEmployee.online ? (
                <Button
                  variant="link"
                  style={{ color: "black" }}
                  className="text-start"
                  onClick={() => handleofflineExecutive(selectedEmployee.id)}
                >
                  <FaUserCheck className="me-2" /> Set offline Employee
                </Button>
              ) : (
                <Button
                  variant="link"
                  style={{ color: "black" }}
                  className="text-start"
                  onClick={() => handleonlineExecutive(selectedEmployee.id)}
                >
                  <FaBan className="me-2" /> Set online Employee
                </Button>
              )}
              {selectedEmployee.is_banned ? (
                <Button
                  variant="link"
                  style={{ color: "black" }}
                  className="text-start"
                  onClick={() =>
                    handleUnbanExecutive(selectedEmployee.id)
                  }
                >
                  <FaUserCheck className="me-2" /> Unban Employee
                </Button>
              ) : (
                <Button
                  variant="link"
                  style={{ color: "black" }}
                  className="text-start"
                  onClick={() =>
                    handleBanExecutive(selectedEmployee.id)
                  }
                >
                  <FaBan className="me-2" /> Ban Employee
                </Button>
              )}
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* Sort Modal */}
      <Modal
        show={showActionModal}
        onHide={() => setShowActionModal(false)}
        size="sm"
      >
        <Modal.Body>
          <div className="d-flex flex-column align-items-center">
            <Button
              variant="light"
              onClick={() => handleSelect("banned")}
              className="mb-2 w-100"
            >
              Banned Executives
            </Button>
            <Button
              variant="light"
              onClick={() => handleSelect("unbanned")}
              className="mb-2 w-100"
            >
              Unbanned Executives
            </Button>
            <Button
              variant="light"
              onClick={() => handleSelect("Active")}
              className="mb-2 w-100"
            >
              Online Executives
            </Button>
            <Button
              variant="light"
              onClick={() => handleSelect("Inactive")}
              className="mb-2 w-100"
            >
              Offline Executives
            </Button>
            {/* New button for All Users */}
            <Button
              variant="light"
              onClick={() => handleSelect("all")}
              className="w-100"
            >
              All Executives
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
        <Pagination.Prev
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        />
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <Pagination.Item
              key={pageNumber}
              active={page === pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              style={{
                backgroundColor:
                  page === pageNumber ? "#5065F6" : "transparent",
                color: page === pageNumber ? "white" : "#000",
                borderRadius: "8px",
                boxShadow:
                  page === pageNumber
                    ? "0px -1px 1px 0px #00000026 inset, 0px 2px 6px 0px #5065F642"
                    : "none",
                transition:
                  "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
              }}
            >
              {pageNumber}
            </Pagination.Item>
          );
        })}
        <Pagination.Next
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        />
        <Pagination.Last
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
        />
      </Pagination>
      <ToastContainer />
    </div>
  );
}

export default Employee;
