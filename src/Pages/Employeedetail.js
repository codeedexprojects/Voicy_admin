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
import { MDBInput } from "mdb-react-ui-kit";
import {
  Dropdown,
  Form,
  Modal,
  Pagination,
  Spinner,
  Table,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import {
  getSingleExecutive,
  deleteSingleExecutive,
  getExecutivecallRating,
  getexecutiveCallHistory,
  editSingleExecutive,
  getSingleExecutivestatistics,
  getexecutivetalktime,
  blockedUsers,
  getSingleExecutivestatisticsPeriod,
  getexecutiverating,
} from "../services/allApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaDownload } from "react-icons/fa";
import { parse, isValid } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function EmployeeDetails() {
  const { id } = useParams();

  const [open, setOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const [blockedUser, setBlockedUser] = useState(null);
  const [callHistoryError, setCallHistoryError] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [user, setUser] = useState({ coins_per_second: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [callHistory, setCallHistory] = useState([]);
  const [isEdited, setIsEdited] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [page, setPage] = useState(1);
  const [talktime, setTalktime] = useState([]);
  const [executiveStats, setExecutiveStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("1m");
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user data
      const userData = await getSingleExecutive(id);
      console.log("singleexecutive", userData);

      setUser({
        name: userData?.name || "",
        age: userData?.age || "",
        education_qualification: userData?.education_qualification || "",
        skills: userData?.skills || "",
        coins_per_second: userData?.coins_per_second || "",
        mobile_number: userData?.mobile_number || "",
        place: userData?.place || "",
        profession: userData?.profession || "",
        id: userData?.id || "",
        executive_id: userData?.executive_id || "",
        email_id: userData?.email_id || "",
        gender: userData?.gender || "",
        status: userData?.status || "N/A",
        password: userData?.password || "",
      });
    } catch (error) {
      setError("Failed to fetch user data");
    }

    try {
      // Fetch call history
      const callHistoryData = await getexecutiveCallHistory(
        id,
        page,
        ITEMS_PER_PAGE
      );
      console.log("callhistiryexecutive",callHistoryData);
      
      setCallHistory(callHistoryData || []);

      if (!callHistoryData || callHistoryData.length === 0) {
        setCallHistoryError("No Call History Found");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setCallHistoryError("Call History Not Found");
      } else if (error.response?.status === 500) {
        setCallHistoryError("Internal Server Error");
      } else {
        setCallHistoryError("Failed to fetch call history");
      }
    }

    try {
      const statisticsData = await getSingleExecutivestatisticsPeriod(id);
      console.log("executive", statisticsData);

      setStatistics(statisticsData || {});
    } catch (error) {
      setError("Failed to fetch statistics");
    }

    try {
      const ratingData = await getexecutiverating(id);
      setRatings(ratingData || []);
    } catch (error) {
      setError("Failed to fetch ratings");
    }

    try {
      const talktimeData = await getSingleExecutivestatisticsPeriod(id);
      setTalktime(talktimeData || {});
    } catch (error) {
      setError("Failed to fetch talktime");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, page]);
  useEffect(() => {
    fetchExecutiveStats(id, selectedPeriod);
  }, [id, selectedPeriod]);

  const fetchExecutiveStats = async (id, period) => {
    setLoading(true);
    try {
      const data = await getSingleExecutivestatisticsPeriod(id, period);
      setExecutiveStats(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching executive statistics:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handlePeriodChange = (period) => {
  //   setSelectedPeriod(period);
  // };
  useEffect(() => {
    const fetchBlockedUser = async () => {
      try {
        const response = await blockedUsers(id);
        setBlockedUser(response.data || null);
      } catch (error) {
        console.error("Error fetching blocked user details:", error);
        setBlockedUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUser();
  }, [id]);

  const [filteredData, setFilteredData] = useState([]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  console.log("execall",currentData);
  
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
    if (!startDate && !endDate) {
      setFilteredData(callHistory);
      return;
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    const filtered = callHistory.filter((item) => {
      const callStartTime = item.call_history?.call_start_time;

      if (!callStartTime) {
        console.warn("Missing call_start_time for item:", item);
        return false;
      }

      // Parse the custom date format
      const callDate = parse(callStartTime, "dd/MM/yyyy hh:mm a", new Date());

      // Ensure the parsed date is valid
      if (!isValid(callDate)) {
        console.warn("Invalid date format for call_start_time:", callStartTime);
        return false;
      }

      return (!start || callDate >= start) && (!end || callDate <= end);
    });

    console.log("Filtered Data:", filtered);
    setFilteredData(filtered);
    setPage(1); // Reset pagination
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

  const downloadExcel = () => {
    // Combine your data into a single array
    const data = [
      { Title: "Total Earnings", Value: executiveStats.earnings || "N/A" },
      {
        Title: "Missed Calls",
        Value: executiveStats.missed_calls_count || "N/A",
      },
      {
        Title: "Average Rating",
        Value: executiveStats.average_rating || "N/A",
      },
      {
        Title: "Total Talktime",
        Value: executiveStats.total_talk_time || "N/A",
      },
      { Title: "Total Calls", Value: executiveStats.total_calls || "N/A" },
      {
        Title: "Coins Earned",
        Value: executiveStats.total_coins_earned || "N/A",
      },
      {
        Title: "Avg Call Duration",
        Value: executiveStats.avg_call_duration || "N/A",
      },
      {
        Title: "Total Online Time",
        Value: executiveStats.total_online_time || "N/A",
      },

      // Include active metrics data
      { Title: "Full Name", Value: user.name },
      { Title: "Age", Value: user.age },
      { Title: "Education", Value: user.education_qualification },
      { Title: "Skills", Value: user.skills },
      { Title: "Coin Per Second", Value: user.coins_per_second },
      { Title: "Phone Number", Value: user.mobile_number },
      { Title: "Place", Value: user.place },
      { Title: "Profession", Value: user.profession },
      { Title: "ID", Value: user.id },
      { Title: "Email Address", Value: user.email_id },
      { Title: "Gender", Value: user.gender },
      { Title: "Status", Value: user.status },
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

  const handleRemove = async () => {
    try {
      const result = await deleteSingleExecutive(id);
      console.log(result.message);

      toast.success("Executive removed successfully!", { autoClose: 3000 });

      handleClose();

      // Wait for 3 seconds (until the toast disappears), then navigate
      setTimeout(() => {
        navigate("/executive");
      }, 2000);
    } catch (error) {
      console.error("Error removing employee:", error.message);

      // Show error toast
      toast.error("Failed to remove the Executive.", { autoClose: 3000 });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "coins_per_second") {
      const decimalValue = value.replace(/[^0-9.]/g, "");
      if (decimalValue === "" || /^\d*\.?\d*$/.test(decimalValue)) {
        setUser({ ...user, [name]: decimalValue });
      }
    } else {
      setUser({ ...user, [name]: value });
    }

    setIsEdited(true);
  };
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    getSingleExecutivestatisticsPeriod(id, period)
      .then((data) => {
        setExecutiveStats(data);
      })
      .catch((error) => {
        console.error("Error fetching executive statistics:", error);
      });
  };
  const handleSave = async () => {
    // Filter out empty fields from user data
    const updatedUser = Object.entries(user).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Ensure required fields have default values
    updatedUser.is_banned =
      user.is_banned !== undefined ? user.is_banned : false;
    updatedUser.is_suspended =
      user.is_suspended !== undefined ? user.is_suspended : false;

    try {
      // Call the API to update the executive data
      const updatedData = await editSingleExecutive(id, updatedUser);

      // If successful, show a success message
      toast.success("Changes saved successfully!");
      setIsEdited(false); // Hide the Save button after saving
    } catch (error) {
      // Handle error if the update fails
      console.error("Error saving data:", error.message);
      toast.error("Failed to save changes.");
    }
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

  return (
    <>
      <ToastContainer />
      <div className="container  my-3">
        <Button
          onClick={() => navigate("/executive")}
          variant="text"
          color="black"
        >
          <ArrowBackIosNewIcon /> Back
        </Button>
        <div className="row my-3">
          <div className="col-md-6 col-12">
            <h4>Employee Details</h4>
          </div>

          <div className="col-md-6 col-12 d-flex justify-content-end align-items-center removeBtn">
            <Dropdown className="me-2">
              <Dropdown.Toggle variant="primary">
                {selectedPeriod === "1d "
                  ? "Last Day"
                  : selectedPeriod === "7d "
                  ? "Last 7 Days"
                  : "Last Month"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handlePeriodChange("1d")}>
                  Last Day
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handlePeriodChange("7d")}>
                  Last 7 Days
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handlePeriodChange("1m ")}>
                  Last Month
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <button
              onClick={downloadExcel}
              style={{ width: "10%" }}
              className=" buttond me-2"
            >
              <FaDownload />
            </button>

            <Button variant="contained" color="error" onClick={handleOpen}>
              <RemoveIcon /> Remove Employee
            </Button>
          </div>
        </div>

        <div className="row row2">
          <p className="heading1 mb-4">Executive Dashboard</p>

          <div className="row g-4">
            <div className="col-xl-3 col-md-6 col-12">
              <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                <MDBCardBody className="cardBody d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                      <img
                        alt="Earnings"
                        className="cardImg"
                        style={{ width: "32px", height: "32px" }}
                        src="https://cdn1.iconfinder.com/data/icons/jetflat-multimedia-vol-4/90/0042_083_favorite_star_rate-1024.png"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <MDBCardTitle className="cardTitle text-muted fs-6 mb-1">
                      Total Earnings
                    </MDBCardTitle>
                    <MDBCardText className="mb-0">
                      <h3 className="mb-0 d-flex align-items-center">
                        <CurrencyRupeeTwoToneIcon
                          fontSize="small"
                          className="me-1"
                        />
                        <span>
                          {executiveStats?.earnings !== null &&
                          executiveStats?.earnings !== undefined
                            ? executiveStats.earnings.toLocaleString()
                            : "N/A"}
                        </span>
                      </h3>
                    </MDBCardText>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                <MDBCardBody className="cardBody d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle">
                      <img
                        alt="Missed Calls"
                        className="cardImg"
                        style={{ width: "32px", height: "32px" }}
                        src="https://st.depositphotos.com/1181187/1450/i/450/depositphotos_14503037-stock-photo-no-sign.jpg"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <MDBCardTitle className="cardTitle text-muted fs-6 mb-1">
                      Missed Calls
                    </MDBCardTitle>
                    <MDBCardText className="mb-0">
                      <h3 className="mb-0">
                        {executiveStats?.missed_calls_count !== null &&
                        executiveStats?.missed_calls_count !== undefined
                          ? executiveStats.missed_calls_count.toLocaleString()
                          : "N/A"}
                      </h3>
                    </MDBCardText>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                <MDBCardBody className="cardBody d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                      <img
                        alt="Rating"
                        className="cardImg"
                        style={{ width: "32px", height: "32px" }}
                        src="https://cdn1.iconfinder.com/data/icons/jetflat-multimedia-vol-4/90/0042_083_favorite_star_rate-1024.png"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <MDBCardTitle className="cardTitle text-muted fs-6 mb-1">
                      Average Rating
                    </MDBCardTitle>
                    <MDBCardText className="mb-0">
                      <h3 className="mb-0 d-flex align-items-center">
                        {executiveStats?.average_rating !== null &&
                        executiveStats?.average_rating !== undefined ? (
                          <>
                            {executiveStats.average_rating}
                            <small className="ms-1 text-muted">/5</small>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </h3>
                    </MDBCardText>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                <MDBCardBody className="cardBody d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                      <img
                        alt="Talktime"
                        className="cardImg"
                        style={{ width: "32px", height: "32px" }}
                        src="https://th.bing.com/th/id/OIP.NIx02QAF7_ncWacSsOO9qwHaHa?w=164&h=180&c=7&r=0&o=5&dpr=1.4&pid=1.7"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <MDBCardTitle className="cardTitle text-muted fs-6 mb-1">
                      Total Talktime
                    </MDBCardTitle>
                    <MDBCardText className="mb-0">
                      <h3 className="mb-0">
                        {executiveStats?.total_talk_time || "N/A"}
                      </h3>
                    </MDBCardText>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>

            {/* Second row of cards */}
            <div className="col-xl-3 col-md-6 col-12">
              <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                <MDBCardBody className="cardBody d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                      <img
                        alt="Total Calls"
                        className="cardImg"
                        style={{ width: "32px", height: "32px" }}
                        src="https://cdn-icons-png.flaticon.com/512/2618/2618179.png"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <MDBCardTitle className="cardTitle text-muted fs-6 mb-1">
                      Total Calls
                    </MDBCardTitle>
                    <MDBCardText className="mb-0">
                      <h3 className="mb-0">
                        {executiveStats?.total_calls !== null &&
                        executiveStats?.total_calls !== undefined
                          ? executiveStats.total_calls.toLocaleString()
                          : "N/A"}
                      </h3>
                    </MDBCardText>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                <MDBCardBody className="cardBody d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                      <img
                        alt="Coins"
                        className="cardImg"
                        style={{ width: "32px", height: "32px" }}
                        src="https://cdn-icons-png.flaticon.com/512/1490/1490853.png"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <MDBCardTitle className="cardTitle text-muted fs-6 mb-1">
                      Coins Earned
                    </MDBCardTitle>
                    <MDBCardText className="mb-0">
                      <h3 className="mb-0">
                        {executiveStats?.total_coins_earned !== null &&
                        executiveStats?.total_coins_earned !== undefined
                          ? executiveStats.total_coins_earned.toLocaleString()
                          : "N/A"}
                      </h3>
                    </MDBCardText>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                <MDBCardBody className="cardBody d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                      <img
                        alt="Call Duration"
                        className="cardImg"
                        style={{ width: "32px", height: "32px" }}
                        src="https://cdn-icons-png.flaticon.com/512/2784/2784459.png"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <MDBCardTitle className="cardTitle text-muted fs-6 mb-1">
                      Avg Call Duration
                    </MDBCardTitle>
                    <MDBCardText className="mb-0">
                      <h3 className="mb-0">
                        {executiveStats?.avg_call_duration || "N/A"}
                      </h3>
                    </MDBCardText>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                <MDBCardBody className="cardBody d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                      <img
                        alt="Online Time"
                        className="cardImg"
                        style={{ width: "32px", height: "32px" }}
                        src="https://cdn-icons-png.flaticon.com/512/1828/1828640.png"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <MDBCardTitle className="cardTitle text-muted fs-6 mb-1">
                      Total Online Time
                    </MDBCardTitle>
                    <MDBCardText className="mb-0">
                      <h3 className="mb-0">
                        {executiveStats?.total_online_time || "N/A"}
                      </h3>
                    </MDBCardText>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>
          </div>
        </div>

        <div className="row row3">
          <div className="col-md-4 col-12">
            <div className="my-3">
              <label className="formHeading">Full Name</label>
              <MDBInput
                id="name"
                type="text"
                name="name"
                value={
                  user.name === null || user.name === undefined ? "" : user.name
                }
                onChange={handleChange}
              />
            </div>

            <div className="my-3">
              <label className="formHeading">Age</label>
              <MDBInput
                id="age"
                type="text"
                name="age"
                value={
                  user.age === null || user.age === undefined ? "" : user.age
                }
                onChange={handleChange}
              />
            </div>
            <div className="my-3">
              <label className="formHeading">Education</label>
              <MDBInput
                id="education_qualification"
                type="text"
                name="education_qualification"
                value={
                  user.education_qualification === null ||
                  user.education_qualification === undefined
                    ? ""
                    : user.education_qualification
                }
                onChange={handleChange}
              />
            </div>
            <div className="my-3">
              <label className="formHeading">Skills</label>
              <MDBInput
                id="skills"
                type="text"
                onChange={handleChange}
                name="skills"
                // disabled
                value={
                  user.skills === null || user.skills === undefined
                    ? ""
                    : user.skills
                }
              />
            </div>

            <div className="my-3">
              <label className="formHeading">Set Coin</label>
              <div style={{ position: "relative", display: "inline-block" }}>
                <MDBInput
                  id="coins_per_second"
                  type="text"
                  name="coins_per_second"
                  onChange={handleChange}
                  value={
                    user.coins_per_second === null ||
                    user.coins_per_second === undefined
                      ? ""
                      : user.coins_per_second
                  }
                  aria-label="Set Coin per Seconds"
                  style={{ paddingRight: "75px" }} // Adjust space for the "coin/min" text
                />
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    fontSize: "1rem",
                    color: "#666",
                    pointerEvents: "none", // Prevent interaction with the "coin/min" text
                    userSelect: "none", // Prevent text selection
                  }}
                >
                  Coin/Sec
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div className="my-3">
              <label className="formHeading">Phone Number</label>
              <MDBInput
                id="mobile_number"
                type="text"
                name="mobile_number"
                onChange={handleChange}
                // disabled
                value={
                  user.mobile_number === null ||
                  user.mobile_number === undefined
                    ? ""
                    : user.mobile_number
                }
              />
            </div>
            <div className="my-3">
              <label className="formHeading">Place</label>
              <MDBInput
                id="place"
                type="text"
                name="place"
                value={
                  user.place === null || user.place === undefined
                    ? ""
                    : user.place
                }
                onChange={handleChange}
              />
            </div>
            <div className="my-3">
              <label className="formHeading">Profession</label>
              <MDBInput
                id="profession"
                type="text"
                // disabled
                onChange={handleChange}
                name="profession"
                value={
                  user.profession === null || user.profession === undefined
                    ? ""
                    : user.profession
                }
              />
            </div>
            <div className="my-3">
              <label className="formHeading">ID</label>
              <MDBInput
                id="form1"
                type="text"
                disabled
                value={user.name === id || user.id === undefined ? "" : user.id}
              />
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div className="my-3">
              <label className="formHeading">Email Address</label>
              <MDBInput
                id="email_id"
                type="text"
                name="email_id"
                value={
                  user.email_id === null || user.email_id === undefined
                    ? ""
                    : user.email_id
                }
                onChange={handleChange}
              />
            </div>
            <div className="my-3">
              <label className="formHeading">Gender</label>
              <select
                id="gender"
                name="gender"
                className="form-select"
                onChange={handleChange}
                value={user.gender || ""}
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="my-3">
              <label className="formHeading">Status</label>
              <select
                id="status"
                name="status"
                className="form-select"
                onChange={handleChange}
                value={user.status || "N/A"}
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="my-3">
              <label className="formHeading">Password</label>
              <MDBInput
                id="password"
                name="password"
                type="text"
                // disabled
                onChange={handleChange}
                value={
                  user.password === null || user.password === undefined
                    ? ""
                    : user.password
                }
              />
            </div>
          </div>
        </div>
        {isEdited && (
          <div className="d-flex justify-content-end my-3">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                padding: "8px 24px",
                fontSize: "14px",

                borderRadius: "8px",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#1565c0",
                  boxShadow: "none",
                },
              }}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        )}
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
            {callHistoryError ? (
              // Display the error message inside the table
              <tr>
                <td colSpan="5" className="text-center ">
                  {callHistoryError}
                </td>
              </tr>
            ) : currentData && currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={index}>
                  <td>{item.call_history?.executive?.name || "N/A"}</td>
                  <td>{item.call_history?.user?.id || "N/A"}</td>
                  <td>{item.call_history?.call_start_time || "N/A"}</td>
                  <td>{item.formatted_duration || "N/A"}</td>
       
                            <td>{item.call_history?.call_end_time || "N/A"}</td>
                  <td>{item.call_history?.status || "N/A"}</td>
                </tr>
              ))
            ) : (
              // Display a fallback message if there's no data
              <tr>
                <td colSpan="5" className="text-center">
                  No Call History Found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

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

        <div
          className="container mt-2 d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="card border-0 shadow" style={{ width: "360px" }}>
            {blockedUser ? (
              <>
                <div className="card-header bg-light text-center">
                  <h5 className="mb-0">Blocked User Details</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="fw-semibold">Name</span>
                      <span>{blockedUser.name}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="fw-semibold">Email</span>
                      <span>{blockedUser.email}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="fw-semibold">Status</span>
                      <span>{blockedUser.status}</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="card-header bg-light text-center">
                  <h5 className="mb-0">No Blocked Users</h5>
                </div>
                <div className="card-body text-center">
                  <p className="text-muted mb-0">
                    There is no blocked user with the provided ID.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p
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
                          {extractTime(rating.created_at)}
                        </p>
                      </div>
                      <div>
                        <p style={{ marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "12px", color: "#757B82" }}>
                            User ID
                          </span>
                        </p>
                        <p style={{ fontSize: "14px", marginBottom: "0.5rem" }}>
                          {rating.user}
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
        </div>

        <Modal
          show={open}
          onHide={handleClose}
          centered
          aria-labelledby="remove-employee-title"
          aria-describedby="remove-employee-description"
        >
          <Modal.Header closeButton>
            <Modal.Title id="remove-employee-title">
              Remove Employee
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p id="remove-employee-description" style={{ margin: "20px 0" }}>
              Are you sure you want to remove this employee?
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
      </div>
    </>
  );
}

export default EmployeeDetails;
