import React, { useEffect, useState } from "react";
import "./EmployeeDetails.css";
import { Button } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
} from "mdb-react-ui-kit";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import { Form, Modal, Pagination, Spinner, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  Addcoinuser,
  deleteSingleUser,
  getPackage,
  getSingleUser,
  getSingleUserstatistics,
  getuserCallHistory,
  getUsercallRating,
  getusercoinbalance,
  getusercoinspend,
} from "../services/allApi";
import { toast, ToastContainer } from "react-toastify";
import { FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ManageUserDetails() {
  const [open, setOpen] = useState(false);
  const { id, user_id } = useParams();
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callError, setCallError] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();
  const [callHistory, setCallHistory] = useState([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [coin, setCoin] = useState(0); // State for the coin count
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [coinSpend, setCoinSpend] = useState(0); // State for the coin count
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [coinBalance, setCoinBalance] = useState(0); // State for the coin count
  const [ratings, setRatings] = useState([]);

  const handleRemove = async () => {
    try {
      const result = await deleteSingleUser(id);
      // console.log(result.message);

      // Show the toast message
      toast.success("User removed successfully!", { autoClose: 3000 });

      // Close the modal
      handleClose();

      // Wait for 3 seconds (until the toast disappears), then navigate
      setTimeout(() => {
        navigate("/userslist");
      }, 3000);
    } catch (error) {
      console.error("Error removing employee:", error.message);

      // Show error toast
      toast.error("Failed to remove the user.", { autoClose: 3000 });
    }
  };
  const formatDuration = (duration) => {
    // Check for null, undefined, or invalid input
    if (!duration || typeof duration !== "string" || !duration.includes(":")) {
      return "N/A";
    }

    try {
      // Split the duration string into its components
      const [hours, minutes, seconds] = duration.split(":");

      // Extract the integer part of seconds
      const [wholeSeconds] = seconds.split(".");

      // Return formatted string
      return `${parseInt(hours, 10)}h ${parseInt(minutes, 10)}m ${parseInt(
        wholeSeconds,
        10
      )}s`;
    } catch (error) {
      // Handle unexpected errors
      return "N/A";
    }
  };
  const extractTime = (isoString) =>
    new Date(isoString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  useEffect(() => {
    setLoading(true);

    getusercoinspend(user_id)
      .then((response) => {
        setCoinSpend(response.total_coins_deducted);

        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data");
        console.error(err);
      });
  }, []);
  useEffect(() => {
    setLoading(true);

    getusercoinbalance(id)
      .then((response) => {
        setCoinBalance(response.coin_balance);
        // console.log("coinspend", response);

        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packagedata = await getPackage(); // Fetch package data
        setPackages(packagedata);
        if (packagedata.length > 0) {
          setSelectedPackage(packagedata[0].id); // Set default selected package
        }
      } catch (error) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getPackage]);

  const addCoin = async () => {
    if (!id || !selectedPackage) {
      setError("Invalid user or package selection");
      return;
    }

    try {
      await Addcoinuser(id, selectedPackage); // Ensure correct arguments
      toast.success("Coins added successfully");
      setShowModal(false); // Close modal after successful action
    } catch (err) {
      setError("Failed to add coins");
    } finally {
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, Statisticsdata, ratingData] = await Promise.all([
          getSingleUser(id),
          getSingleUserstatistics(id),
          getUsercallRating(id),
        ]);
        setUser(userData);
        setStatistics(Statisticsdata);
        setRatings(ratingData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
  
      try {
        const callHistoryData = await getuserCallHistory(id, page, ITEMS_PER_PAGE);
        setCallHistory(callHistoryData);
        setCallError(null); // Reset error on successful fetch
      } catch (error) {
        setCallError("Error fetching call history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, page]);
  
  const [filteredData, setFilteredData] = useState([]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  useEffect(() => {
    setFilteredData(callHistory);
  }, [callHistory]);

  // Handle date range filtering
  const handleFilter = () => {
    const filtered = callHistory.filter((item) => {
      const callDate = new Date(item.start_time);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (!start || callDate >= start) && (!end || callDate <= end);
    });

    setFilteredData(filtered);
    setPage(1); // Reset to the first page after filtering
  };

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
    return <div className="text-danger">Error: {error}</div>; // Display error message in red
  }

  // Handle opening the modal
  const handleAddCoin = () => {
    setShowModal(true);
  };

  const downloadExcel = () => {
    // Combine your data into a single array
    const data = [
      { Title: "ID", Value: user.user_id },
      { Title: "Gender", Value: user.gender },
      { Title: "Total Purchase", Value: statistics.Total_Purchases },
      { Title: "Total Talktime", Value: statistics.Total_Talktime },
      { Title: "Coin Spend", Value: statistics.Total_Coin_Spent },

      // Include active metrics data
      // { Title: 'Full Name', Value: user.name  },
      // { Title: 'Age', Value: user.age  },
      // { Title: 'Education', Value: user.education_qualification  },
      // { Title: 'Skills', Value: user.skills  },
      // { Title: 'Coin Per Second', Value: user.coins_per_minute  },
      // { Title: 'Phone Number', Value: user.mobile_number  },
      // { Title: 'Place', Value: user.place  },
      // { Title: 'Profession', Value: user.profession  },
      // { Title: 'ID', Value: user.id  },
      // { Title: 'Email Address', Value: user.email_id  },
      // { Title: 'Gender', Value: user.gender  },
      // { Title: 'Status', Value: user.status  },
    ];

    // Create worksheet from the data
    const ws = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Metrics Data");

    // Write the workbook to a binary Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Save the file
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "executive_detail.xlsx");
  };
  const formatTalkTime = (totalSeconds) => {
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor((totalSeconds / 3600) % 24);
    const days = Math.floor(totalSeconds / 86400);

    let formattedTime = "";

    if (days > 0) {
      formattedTime += `${days} days `;
    }
    if (hours > 0) {
      formattedTime += `${hours} hr `;
    }
    if (minutes > 0) {
      formattedTime += `${minutes} min `;
    }
    formattedTime += `${seconds} s`;

    return formattedTime.trim();
  };
  return (
    <>
      {" "}
      <ToastContainer />
      <div className="container  my-3">
        <Button
          variant="text"
          color="black"
          onClick={() => navigate("/manage-user")}
        >
          <ArrowBackIosNewIcon /> Back
        </Button>

        {/* <div className="row my-3"> */}
          {/* <div className="col-md-6 col-12  ">
            <h4>User Details</h4>
          </div> */}
          {/* <div className="col-md-6 col-12 removeBtn d-flex justify-content-end align-items-center">
            <Button
              style={{
                width: "30%",
                backgroundColor: "#fdba00",
                color: "white",
              }}
              className="me-2"
              onClick={handleAddCoin}
            >
              + Add Coin
            </Button>
            <button
              onClick={downloadExcel}
              style={{ width: "10%" }}
              className=" buttond me-2"
            >
              <FaDownload />
            </button>
            <Button variant="contained" color="error" onClick={handleOpen}>
              <RemoveIcon /> Remove User
            </Button>
          </div> */}
        {/* </div> */}
        {/* <div className="row row2">
          <p className="heading1">Personal Information</p> */}

          {/* Column for ID and Gender Forms */}
          {/* <div className="col-md-3 col-12">
            <label htmlFor="employeeID">ID:</label>
            <input
              style={{ background: "white" }}
              type="text"
              id="employeeID"
              className="form-control" // Add Bootstrap class for styling
              placeholder={user?.user_id || "N/A"}
              disabled
            />

            <label htmlFor="genderSelect" className="mt-3">
              Gender:
            </label>
            <input
              style={{ background: "white" }}
              type="text"
              id="gender"
              className="form-control" // Add Bootstrap class for styling
              placeholder={user?.gender || "N/A"}
              disabled
            />
            <label htmlFor="genderSelect" className="mt-3">
              Phone No:
            </label>
            <input
              style={{ background: "white" }}
              type="text"
              id="phone"
              className="form-control" // Add Bootstrap class for styling
              placeholder={user?.mobile_number || "N/A"}
              disabled
            />
          </div> */}

          {/* Total Purchase Card */}
          {/* <div className="col-md-3 col-12 mt-3">
            <MDBCard className="card" style={{ height: "100%" }}>
              <MDBCardBody
                className="cardBody"
                style={{
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  alt=""
                  className="cardImg"
                  src="https://th.bing.com/th/id/OIP.NIx02QAF7_ncWacSsOO9qwHaHa?w=164&h=180&c=7&r=0&o=5&dpr=1.4&pid=1.7"
                  style={{ width: "40px", height: "40px", marginRight: "1rem" }}
                />
                <div style={{ flex: 1 }}>
                  <MDBCardTitle className="cardTitle">
                    Total Purchase
                  </MDBCardTitle>
                  <MDBCardText className="mb-0" style={{ marginBottom: "0" }}>
                    <h4>
                      <CurrencyRupeeTwoToneIcon />
                      {statistics?.Total_Purchases || "0"}
                    </h4>
                  </MDBCardText>
                </div>
              </MDBCardBody>
            </MDBCard>
          </div> */}

          {/* Total Talktime Card */}
          {/* <div className="col-md-3 col-12 mt-3">
            <MDBCard className="card" style={{ height: "100%" }}>
              <MDBCardBody
                className="cardBody"
                style={{
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  alt=""
                  className="cardImg"
                  src="https://st.depositphotos.com/1181187/1450/i/450/depositphotos_14503037-stock-photo-no-sign.jpg"
                  style={{ width: "40px", height: "40px", marginRight: "1rem" }}
                />
                <div style={{ flex: 1 }}>
                  <MDBCardTitle className="cardTitle">
                    Total Talktime
                  </MDBCardTitle>
                  <MDBCardText className="mb-0" style={{ marginBottom: "0" }}>
                    <h4>{formatTalkTime(statistics?.total_talktime || "0")}</h4>
                  </MDBCardText>
                </div>
              </MDBCardBody>
            </MDBCard>
          </div> */}

          {/* Coin Spend Card */}
          {/* <div className="col-md-3 col-12 mt-3">
            <MDBCard className="card" style={{ height: "100%" }}>
              <MDBCardBody
                className="cardBody"
                style={{
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  alt=""
                  className="cardImg"
                  src="https://cdn1.iconfinder.com/data/icons/jetflat-multimedia-vol-4/90/0042_083_favorite_star_rate-1024.png"
                  style={{ width: "40px", height: "40px", marginRight: "1rem" }}
                />
                <div style={{ flex: 1 }}>
                  <MDBCardTitle className="cardTitle">Coin Spend</MDBCardTitle>
                  <MDBCardText className="mb-0" style={{ marginBottom: "0" }}>
                    <h4>{coinSpend || "0"}</h4>
                  </MDBCardText>
                </div>
              </MDBCardBody>
            </MDBCard>
          </div> */}

          {/* <div className="col-md-3 col-12 mt-3">
            <MDBCard className="card" style={{ height: "100%" }}>
              <MDBCardBody
                className="cardBody"
                style={{
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  alt=""
                  className="cardImg"
                  src="https://cdn1.iconfinder.com/data/icons/jetflat-multimedia-vol-4/90/0042_083_favorite_star_rate-1024.png"
                  style={{ width: "40px", height: "40px", marginRight: "1rem" }}
                />
                <div style={{ flex: 1 }}>
                  <MDBCardTitle className="cardTitle">
                    Coin balance
                  </MDBCardTitle>
                  <MDBCardText className="mb-0" style={{ marginBottom: "0" }}>
                    <h4>{coinBalance || "0"}</h4>
                  </MDBCardText>
                </div>
              </MDBCardBody>
            </MDBCard>
          </div> */}
        {/* </div> */}

        <div className="col-md-4 col-12 my-4"></div>
        <p
          className=" d-flex justify-content-between align-items-center "
          style={{ fontSize: "28px" }}
        >
          Call History
        </p>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
            className="me-2"
          />
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            className="me-2"
          />
          <button className="btn btn-primary" onClick={handleFilter}>
            Filter
          </button>
        </div>

        {/* Call History Table */}
        <Table hover responsive="sm" className="request-table">
  <thead>
    <tr>
      <td>Executive</td>
      <td>User ID</td>
      <td>Start Time</td>
      <td>Duration</td>
      <td>End Time</td>
      <td>Status</td>
    </tr>
  </thead>
  <tbody>
  {callError ? (
      <tr>
        <td colSpan="6" className="text-center text-danger fw-bold">
          {callError}
        </td>
      </tr>
    ) :
    Array.isArray(currentData) && currentData.length > 0 ? (
      currentData.map((item, index) => (
        <tr key={index}>
          <td>{item.executive?.name || "N/A"}</td>
          <td>{item.user?.user_id || "N/A"}</td>
          <td>{item.formatted_start_time || "N/A"}</td>
          <td>{item.formatted_duration || "N/A"}</td>
          <td>{item.formatted_end_time || "N/A"}</td>
          <td>{item.status || "N/A"}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6" className="text-center">
          {currentData === null || currentData === undefined
            ? "No call history available"
            : "No call history"}
        </td>
      </tr>
    )}
  </tbody>
</Table>


        {/* Pagination */}
        <Pagination className="justify-content-center mt-4">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(page - 1)}
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
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
          />
        </Pagination>
        {/* <p
          className=" d-flex justify-content-between align-items-center "
          style={{ fontSize: "28px" }}
        >
          Ratings
        </p>
        <div className="row">
          {ratings.length === 0 ? (
            <div className="col-12">
              <p
                style={{
                  textAlign: "center",
                  fontSize: "18px",
                  color: "#757B82",
                }}
              >
                No ratings available.
              </p>
            </div>
          ) : (
            ratings.map((rating, index) => (
              <div className="col-md-3 col-12 mb-3" key={index}>
                <MDBCard className="h-100">
                  <MDBCardBody>
                    <p style={{ fontSize: "18px", marginBottom: "0.5rem" }}>
                      {rating.id}
                    </p>
                    <div className="d-flex justify-content-between">
                      <div>
                        <p style={{ marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "12px", color: "#757B82" }}>
                            Rating
                          </span>
                        </p>
                        <p style={{ fontSize: "14px", marginBottom: "0.5rem" }}>
                          {rating.stars}
                        </p>
                        <p style={{ marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "12px", color: "#757B82" }}>
                            Time
                          </span>
                        </p>
                        <p style={{ fontSize: "14px", marginBottom: "0.5rem" }}>
                          {" "}
                          {extractTime(rating.created_at)}
                        </p>
                      </div>
                      <div>
                        <p style={{ marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "12px", color: "#757B82" }}>
                            Executive ID
                          </span>
                        </p>
                        <p style={{ fontSize: "14px", marginBottom: "0.5rem" }}>
                          {rating.executive}
                        </p>
                        <p style={{ marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "12px", color: "#757B82" }}>
                            Call Duration
                          </span>
                        </p>
                        <p style={{ fontSize: "14px", marginBottom: "0.5rem" }}>
                          {" "}
                          {formatDuration(rating.duration)}
                        </p>
                      </div>
                    </div>
                    <p style={{ marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "12px", color: "#757B82" }}>
                        Message
                      </span>
                    </p>
                    <p style={{ fontSize: "16px", marginBottom: "0" }}>
                      {rating.comment}
                    </p>
                  </MDBCardBody>
                </MDBCard>
              </div>
            ))
          )}
        </div> */}
        {/* <Modal
          show={open}
          onHide={handleClose}
          centered
          aria-labelledby="remove-employee-title"
          aria-describedby="remove-employee-description"
        >
          <Modal.Header closeButton>
            <Modal.Title id="remove-employee-title">Remove User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p id="remove-employee-description" style={{ margin: "20px 0" }}>
              Are you sure you want to remove this user?
            </p>
          </Modal.Body>
          <Modal.Footer
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <div style={{ display: "flex", gap: "30px" }}>
              <button id="cancelb" onClick={handleClose}>
                Cancel
              </button>
              <button id="removeb" onClick={handleRemove}>
                Remove
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Coin Count</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loading ? (
              <Spinner animation="border" />
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <Form>
                <Form.Group>
                  <Form.Label>Select Package</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.plan_name} - {pkg.coin_package}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={addCoin}>
              Add
            </Button>
          </Modal.Footer>
        </Modal> */}
      </div>
    </>
  );
}

export default ManageUserDetails;
