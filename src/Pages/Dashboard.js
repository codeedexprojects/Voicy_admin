import React, { useEffect, useState } from "react";
import { Row, Col, Card, Dropdown, Spinner } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./Dashboard.css";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Bar,
  BarChart,
} from "recharts";
import { BsPersonCircle } from "react-icons/bs";
import people from "../People_Users_White_Icon_PNG-removebg-preview.png";
import wallet from "../15479354-removebg-preview.png";
import Coin from "../3840x2400-80933273-cube-sign-illustration-vector-white-icon-with-soft-shadow-on-transparent-background__1_-removebg-preview.png";
import {
  editRevenue,
  getCallstatistics,
  getCallstatisticsmonthly,
  getFullReport,
  getRevenue,
  getAdminPurchase,
} from "../services/allApi";
import CountUp from "react-countup";
import { FaFileExcel } from "react-icons/fa";
import Carousel from "../Components/Carousel";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const shadowFilter = `
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="rgba(0, 0, 0, 0.2)" />
    </filter>
  </defs>
`;

const data = {
  weekly: [
    { label: "Sun", executive: 3, user: 2, totalTalktime: 7 },
    { label: "Mon", executive: 2.5, user: 6.2, totalTalktime: 5.7 },
    { label: "Tue", executive: 3, user: 7.5, totalTalktime: 6.5 },
    { label: "Wed", executive: 3.8, user: 9.2, totalTalktime: 8 },
    { label: "Thu", executive: 2.9, user: 3.8, totalTalktime: 6.7 },
    { label: "Fri", executive: 4, user: 4.5, totalTalktime: 8.5 },
    { label: "Sat", executive: 3.5, user: 4, totalTalktime: 7.5 },
  ],
  monthly: [
    { label: "Week 1", executive: 10, user: 12, totalTalktime: 22 },
    { label: "Week 2", executive: 12, user: 14, totalTalktime: 26 },
    { label: "Week 3", executive: 14, user: 16, totalTalktime: 30 },
    { label: "Week 4", executive: 16, user: 18, totalTalktime: 34 },
  ],
};

const Dashboard = () => {
  const [chartData, setChartData] = useState(data.weekly);
  const [view, setView] = useState("Weekly");
  const [chartType, setChartType] = useState("Line");
  const [statistics, setStatistics] = useState([]);
  const [adminPurchase, setAdminPurchase] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [revenue, setRevenue] = useState({
    target_revenue: 0,
    covered_revenue: 0,
    target_talktime: 0,
    covered_talktime: 0,
  });

  const [updatedRevenue, setUpdatedRevenue] = useState({
    target_revenue: 0,
    target_talktime: 0,
  });

  useEffect(() => {
    const fetchCallStatistics = async () => {
      try {
        let data;
        if (view === "Weekly") {
          data = await getCallstatistics();

          setChartData(data.weekly); // Access the weekly data
          // console.log("call", data);
        } else if (view === "Monthly") {
          data = await getCallstatisticsmonthly();
          setChartData(data.monthly); // Assuming the monthly data is in the correct format
        }
      } catch (err) {
        setError(err.message);
      } finally {
      }
    };
    fetchCallStatistics();
  }, [view]);

  const downloadExcel = () => {
    const metricsData = [
      ...metrics.map((item) => ({
        Title: item.title,
        Value: item.value,
      })),
      ...activeMetrics.map((item) => ({
        Title: item.title,
        Value: item.value,
      })),
      {
        Title: "Target Revenue",
        Value: updatedRevenue.target_revenue,
      },
      {
        Title: "Today Talktime",
        Value: statistics.today_talk_time || 0,

      },
      {
        Title: "Today Total Calls",
        Value: statistics.today_total_calls || 0,
      },
      {
        Title: "Today Coin Sales",
        Value: statistics.coin_sales_today || 0,
      },
      {
        Title: "Active Executives",
        Value: statistics.active_executives || 0,
      },
      {
        Title: "Active Users",
        Value: statistics.active_users || 0,
      },
      {
        Title: "On Call",
        Value: statistics.on_call || 0,
      },
      {
        Title: "Today Missed Calls",
        Value: updatedRevenue.missed_calls_today,
      },
      {
        Title: "Target Talktime",
        Value: updatedRevenue.target_talktime,
      },
      {
        Title: "Total Revenue",
        Value: revenue.covered_revenue,
      },
      {
        Title: "Total Calls",
        value: revenue.total_calls,
      },
      {
        Title: "Total Talktime",
        Value: revenue.covered_talktime,
      },
      {
        Title: "Total Coin Sales",
        Value: revenue.coin_sales_all_time,
      },
      {
        Title: "All time Revenue",
        Value: revenue.revenue_all_time,
      },
      {
        Title: "Total Admin Spent",
        Value: adminPurchase.total_admin_spent || 0,
      },
      {
        Title: "Total Missed Calls",
        Value: statistics.total_missed_calls || 0,
      }

    ];

    const ws = XLSX.utils.json_to_sheet(metricsData);

    // Auto adjust column width
    ws["!cols"] = [
      { wch: 25 }, // Column 1 width
      { wch: 15 }, // Column 2 width
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Metrics Data");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "metrics_data.xlsx");
  };

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const data = await getRevenue();
        // console.log(data, "Fetched revenue data");

        // Directly set the revenue with the fetched data
        setRevenue(data);
      } catch (err) {
        console.error("Error fetching revenue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);
  useEffect(() => {
    const fetchAdminPurchase = async () => {
      try {
        const data = await getAdminPurchase();
        console.log("Admin Purchase Data:", data);
        setAdminPurchase(data);
      } catch (err) {
        console.error("Error fetching admin purchase data:", err);
      }
    };
    fetchAdminPurchase();
  }, []);

  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (revenue) {
      setUpdatedRevenue({
        target_revenue: revenue.target_revenue || 0, // Default to 0 if undefined
        target_talktime: revenue.target_talktime || "", // Default to empty string if undefined
      });
    } else {
      setUpdatedRevenue({
        target_revenue: 0, // Default value for null revenue
        target_talktime: "", // Default value for null revenue
      });
    }
  }, [revenue]);

  const handleEditClick = () => {
    if (isEditable) {
      // Save the updated data to the API
      editRevenue(updatedRevenue)
        .then((response) => {
          // Update the state with the new values from the response
          setRevenue({
            ...revenue,
            target_revenue:
              response.data.target_revenue || updatedRevenue.target_revenue,
            target_talktime:
              response.data.target_talktime || updatedRevenue.target_talktime,
          });
          setIsEditable(false);

          // Show success toast
          toast.success("Target updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating Target:", error);

          // Show error toast
          toast.error("Failed to update Target!");
        });
    } else {
      setIsEditable(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedRevenue({ ...updatedRevenue, [name]: value });
  };

  const revenueProgress =
    revenue && revenue.target_revenue > 0
      ? (revenue.covered_revenue / revenue.target_revenue) * 100
      : 0;

  const talkTimeProgress =
    revenue && revenue.target_talktime > 0
      ? (revenue.covered_talktime / revenue.target_talktime) * 100
      : 0;

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await getFullReport();
        // console.log("dstatistica", data);

        setStatistics(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchStatistics();
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
  const handleSelect = (eventKey) => {
    setView(eventKey);
  };

  const handleChartTypeSelect = (eventKey) => {
    setChartType(eventKey);
  };
  const metrics = [
    {
      title: "Total Executives",
      value: statistics.total_executives,
      icon: <BsPersonCircle />,
      iconBg: "#5065F6",
      outerBg: "#EDEFFE",
    },
    {
      title: "Total Users",
      value: statistics.total_users,
      icon: (
        <img
          src={people}
          alt="Total Users"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#28B95E",
      outerBg: "#E9F9EF",
    },
    {
      title: "Today's Revenue",
      value: statistics.revenue_today,
      icon: (
        <img
          src={wallet}
          alt="Today's Revenue"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#FFDB45",
      outerBg: "#FFF8DA",
    },

     {
      title: "Total Revenue",
      value: statistics.revenue_all_time,
      icon: (
        <img
          src={wallet}
          alt="Total Revenue"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#FFDB45",
      outerBg: "#FFF8DA",
    },

    {
      title: "Today's Coin Sales",
      value: statistics.coin_sales_today,
      icon: (
        <img
          src={Coin}
          alt="Today's Coin Sales"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#F04B69",
      outerBg: "#FDEDF0",
    },
     {
      title: "Total Coin Sales",
      value: statistics.coin_sales_all_time,
      icon: (
        <img
          src={Coin}
          alt="Total Coin Sales"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#F04B69",
      outerBg: "#FDEDF0",
    }
  ];

  const activeMetrics = [
    {
      title: "Active Executives",
      value: statistics.active_executives,
      icon: <BsPersonCircle />,
      iconBg: "#5065F6",
      outerBg: "#EDEFFE",
    },
    {
      title: "Active Users",
      value: statistics.active_users,
      icon: (
        <img
          src={people}
          alt="Active Users"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#28B95E",
      outerBg: "#E9F9EF",
    },
    {
      title: "On Call",
      value: statistics.on_call,
      icon: (
        <img
          src={wallet}
          alt="On Call"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#FFDB45",
      outerBg: "#FFF8DA",
      navigateTo: "/on-call",
    },
      {
      title: "Today Total Calls",
      value: statistics.today_total_calls,
      icon: (
        <img
          src={wallet}
          alt="On Call"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#FFDB45",
      outerBg: "#FFF8DA",
      // navigateTo: "/on-call",
    },
    
    
    {
      title: "Total Calls",
      value: statistics.total_calls,
      icon: (
        <img
          src={wallet}
          alt="On Call"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#FFDB45",
      outerBg: "#FFF8DA",
      // navigateTo: "/on-call",
    },
    {
      title: "Total Talk Time",
      value: statistics.total_talk_time,
      icon: (
        <img
          src={Coin}
          alt="Total Talk Time"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#F04B69",
      outerBg: "#FDEDF0",
    },
     {
      title: "Today TalkTime",
      value: statistics.today_talk_time,
      icon: (
        <img
          src={Coin}
          alt="Today Talk Time"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#F04B69",
      outerBg: "#FDEDF0",
    },
     {
      title: "Today Missed Calls",
      value: statistics.missed_calls_today,
      icon: (
        <img
          src={Coin}
          alt="Total Talk Time"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#F04B69",
      outerBg: "#FDEDF0",
    },
    {
      title: "Total Missed Calls",
      value: statistics.total_missed_calls,
      icon: (
        <img
          src={Coin}
          alt="Total Talk Time"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#F04B69",
      outerBg: "#FDEDF0",
    },
    {
      title: "Total Admin Spent",
      value: adminPurchase.total_admin_spent,
      icon: (
        <img
          src={wallet}
          alt="On Call"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      iconBg: "#FFDB45",
      outerBg: "#FFF8DA",
      navigateTo: "/account",
    },
  ];

// In your Dashboard component where you handle the navigation:
const handleCardClick = (metric) => {
  if (metric.title === "Total Admin Spent") {
    navigate('/account', { state: { showAdminOnly: true } });
  } else if (metric.title === "On Call") {
    navigate('/activities');
  }
};

  const MetricCard = ({ metric }) => (
    <Col
      xs={12}
      sm={6}
      md={4}
      lg={2}
      className="mb-3 d-flex justify-content-center"
    >
      <Card
        className="metric-card shadow-sm rounded"
        style={{
          width: "100%",
          maxWidth: "160px",
          cursor: metric.navigateTo ? "pointer" : "default",
        }}
        onClick={() => metric.onClick ? metric.onClick() : handleCardClick(metric)}
      >
        <Card.Body className="d-flex flex-column align-items-center text-center py-3">
          <div
            className="metric-icon-container d-flex justify-content-center align-items-center mb-2"
            style={{
              backgroundColor: metric.outerBg,
              width: "50px",
              height: "50px",
              borderRadius: "50%",
            }}
          >
            <div
              className="inner-circle d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: metric.iconBg,
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                color: "#fff",
                fontSize: "20px",
              }}
            >
              {metric.icon}
            </div>
          </div>
          <p
            className="metric-title mb-1 text-muted"
            style={{ fontSize: "14px", fontWeight: "600" }}
          >
            {metric.title}
          </p>
          <p
            className="metric-value mb-0"
            style={{ fontSize: "16px", fontWeight: "700" }}
          >
            <CountUp
              start={0}
              end={metric.value}
              duration={2.5}
              separator=","
            />
            {metric.title === "Total Talk Time" && " Min"}
          </p>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <div className="dashboard-container">
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: "1000",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #28a745, #218838)",
            color: "white",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s, box-shadow 0.3s, background 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.3)";
            e.currentTarget.style.background =
              "linear-gradient(135deg, #218838, #28a745)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
            e.currentTarget.style.background =
              "linear-gradient(135deg, #28a745, #218838)";
          }}
        >
          <FaFileExcel onClick={downloadExcel} size={24} color="white" />
        </div>
        <span
          style={{
            marginTop: "8px",
            fontSize: "14px",
            color: "#333",
            textAlign: "center",
            fontWeight: "bold",
          }}
        ></span>
      </div>

      <Row className="mb-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
        {activeMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </Row>
      <Row className="mb-4"></Row>

      {/* <Row className="mb-4" style={{ margin: "0px" }}>
        <Col>
          <Card className="custom-card shadow-sm p-3 rounded">
            <Card.Body
              style={{ padding: "0px" }}
              className="d-flex align-items-center justify-content-between"
            > */}
      {/* <div className="d-flex align-items-center">
                <BsPersonCircle size={40} color="#5065F6" />
                <div className="ms-3">
                  <h5>User Roles & Permissions</h5>
                  <p>Manage all user roles and their permissions effectively</p>
                </div>
              </div> */}
      {/* <div
                className="manage-roles-container d-flex align-items-center"
                onClick={() => (window.location.href = "/roles")}
                style={{
                  cursor: "pointer",
                  textAlign: "center",
                  padding: "10px",
                  borderRadius: "5px",
                  backgroundColor: "#f1f1f1",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e2e2e2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f1f1")
                }
              >
                <BsGearFill style={{ marginRight: "5px" }} />
                <span style={{ fontWeight: "bold" }}>Manage Roles</span>
              </div> */}
      {/* </Card.Body>
          </Card>
        </Col>
      </Row> */}

      <Row className="mb-4">
        <Carousel></Carousel>
      </Row>

      <Row
        className="mb-4 mt-3 d-flex align-items-stretch h-100"
        style={{ minHeight: "100%", margin: "0px" }}
      >
        <Col md={7} className="d-flex flex-column">
          <Card className="shadow-sm flex-grow-1 d-flex">
            <Card.Body className="p-4 flex-grow-1 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title">Call Activity</h5>

                {/* Dropdown for View */}
                <Dropdown
                  onSelect={handleSelect}
                  style={{ background: "#F3F3F7" }}
                >
                  <Dropdown.Toggle variant="light" id="dropdown-basic">
                    {view}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="Weekly">Weekly</Dropdown.Item>
                    <Dropdown.Item eventKey="Monthly">Monthly</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Dropdown for Chart Type */}
                <Dropdown
                  onSelect={handleChartTypeSelect}
                  style={{ background: "#F3F3F7" }}
                >
                  <Dropdown.Toggle variant="light" id="chart-type-dropdown">
                    {chartType} Chart
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="Line">Line</Dropdown.Item>
                    <Dropdown.Item eventKey="Bar">Bar</Dropdown.Item>
                    <Dropdown.Item eventKey="Area">Area</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                {chartType === "Line" && (
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs dangerouslySetInnerHTML={{ __html: shadowFilter }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" />
                    <Line
                      type="monotone"
                      dataKey="executive"
                      stroke="#3498db"
                      strokeWidth={3}
                      dot={{ stroke: "#3498db", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 8 }}
                      filter="url(#shadow)"
                    />
                    <Line
                      type="monotone"
                      dataKey="user"
                      stroke="#9b59b6"
                      strokeWidth={3}
                      dot={{ stroke: "#9b59b6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 8 }}
                      filter="url(#shadow)"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalTalktime"
                      stroke="#1abc9c"
                      strokeWidth={3}
                      dot={{ stroke: "#1abc9c", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 8 }}
                      filter="url(#shadow)"
                    />
                  </LineChart>
                )}

                {chartType === "Bar" && (
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" />
                    <Bar dataKey="executive" fill="#3498db" />
                    <Bar dataKey="user" fill="#9b59b6" />
                    <Bar dataKey="totalTalktime" fill="#1abc9c" />
                  </BarChart>
                )}

                {chartType === "Area" && (
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" />
                    <Area
                      type="monotone"
                      dataKey="executive"
                      stroke="#3498db"
                      fill="#3498db"
                    />
                    <Area
                      type="monotone"
                      dataKey="user"
                      stroke="#9b59b6"
                      fill="#9b59b6"
                    />
                    <Area
                      type="monotone"
                      dataKey="totalTalktime"
                      stroke="#1abc9c"
                      fill="#1abc9c"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5} className="d-flex flex-column">
          <Card className="shadow-sm p-4 flex-grow-1 d-flex flex-column">
            <p style={{ fontSize: "16px" }} className="mb-3">
              Target Revenue
            </p>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                style={{ fontSize: "16px" }}
                type="text"
                className="form-control w-75"
                name="target_revenue"
                value={updatedRevenue.target_revenue}
                readOnly={!isEditable}
                onChange={handleInputChange}
              />
            </div>
            <p style={{ fontSize: "16px" }} className="mb-3">
              Target Talk Time
            </p>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                style={{ fontSize: "16px" }}
                type="text"
                className="form-control w-75"
                name="target_talktime"
                value={updatedRevenue.target_talktime}
                readOnly={!isEditable}
                onChange={handleInputChange}
              />
              <button className="ml-2 editd" onClick={handleEditClick}>
                {isEditable ? "Save" : "Edit"}
              </button>
            </div>

            {/* Rest of your code for circular progress bars */}
            <div className="d-flex justify-content-between align-items-center flex-grow-1">
              <Col className="d-flex justify-content-center">
                <div
                  style={{
                    position: "relative",
                    width: "160px",
                    height: "160px",
                  }}
                >
                  <CircularProgressbar
                    value={revenueProgress}
                    strokeWidth={10}
                    styles={buildStyles({
                      pathColor: "#ff6384",
                      trailColor: "rgba(192, 192, 192, 0.5)",
                      strokeLinecap: "round",
                    })}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "15%",
                      left: "15%",
                      width: "70%",
                      height: "70%",
                    }}
                  >
                    <CircularProgressbar
                      value={talkTimeProgress}
                      strokeWidth={10}
                      styles={buildStyles({
                        pathColor: "#ffce56",
                        trailColor: "rgba(192, 192, 192, 0.5)",
                        strokeLinecap: "round",
                      })}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: "30%",
                      left: "30%",
                      width: "40%",
                      height: "40%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "#fff",
                      borderRadius: "50%",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <span>{100}</span>
                  </div>
                </div>
              </Col>
              <Col className="ml-4 text-right">
                {revenue ? (
                  <>
                    <p
                      style={{
                        color: "#9EA3A7",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Total Revenue
                    </p>
                    <h3 className="metric-value mb-2">
                      ₹{revenue.covered_revenue || 0}
                    </h3>
                    <p
                      style={{
                        color: "#9EA3A7",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Total Talktime
                    </p>
                    <h3 className="metric-value mb-2">
                      {revenue.covered_talktime || 0}
                    </h3>
                    <ul className="list-unstyled">
                      <li>
                        <span style={{ color: "#ff6384" }}>●</span> Revenue
                      </li>
                      <li>
                        <span style={{ color: "#ffce56" }}>●</span> Total
                        Talktime
                      </li>
                    </ul>
                  </>
                ) : (
                  <p
                    style={{
                      color: "#9EA3A7",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Revenue data is not available.
                  </p>
                )}
              </Col>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
