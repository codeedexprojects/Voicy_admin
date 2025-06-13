import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Report.css";
import { getFullReport } from "../services/allApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
function Report() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await getFullReport();
        console.log(data);

        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const downloadExcel = () => {
    if (!reportData) return;

    const worksheet = XLSX.utils.json_to_sheet([reportData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(data, "Analytics_Report.xlsx");
  };

  // Format time function
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString(); // Converts to readable date-time
  };
  return (
    <div className="container-fluid report-container">
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h1 className="report-title">Analytics Report</h1>
        </div>
        <div className="col-md-6 text-md-end">
          <button
            className="btn btn-primary report-excel-btn"
            onClick={downloadExcel}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>
            Download Excel
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-total-executives">
            <h5>
              <i className="bi bi-people me-2"></i>Total Executives
            </h5>
            <div className="report-metric-value">
              {reportData.total_executives}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-total-users">
            <h5>
              <i className="bi bi-person me-2"></i>Total Users
            </h5>
            <div className="report-metric-value">{reportData.total_users}</div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-revenue">
            <h5>
              <i className="bi bi-cash-coin me-2"></i>Today's Revenue
            </h5>
            <div className="report-metric-value">
              {reportData.todays_revenue}
            </div>
          </div>
        </div>

        {/* Coin Sales */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-sales">
            <h5>
              <i className="bi bi-coin me-2"></i>Coin Sales
            </h5>
            <div className="report-metric-value">
              {reportData.todays_coin_sales}
            </div>
          </div>
        </div>

        {/* Active Executives */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-active-executives">
            <h5>
              <i className="bi bi-person-check me-2"></i>Active Executives
            </h5>
            <div className="report-metric-value">
              {reportData.active_executives}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-active-users">
            <h5>
              <i className="bi bi-person-check me-2"></i>Active Users
            </h5>
            <div className="report-metric-value">{reportData.active_users}</div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-on-call">
            <h5>
              <i className="bi bi-telephone me-2"></i>On Call
            </h5>
            <div className="report-metric-value">{reportData.on_call}</div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-talk-time">
            <h5>
              <i className="bi bi-clock-history me-2"></i>Daily Talk Time
            </h5>
            <div className="report-metric-value">
              {reportData.today_talk_time}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-spending">
            <h5>
              <i className="bi bi-person me-2"></i>User Coin Spending
            </h5>
            <div className="report-metric-value">
              {reportData.user_coin_spending}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-earnings">
            <h5>
              <i className="bi bi-graph-up me-2"></i>Executive Earnings
            </h5>
            <div className="report-metric-value">
              {reportData.executive_coin_earnings}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="report-metric-card report-missed">
            <h5>
              <i className="bi bi-telephone-x me-2"></i>Missed Calls
            </h5>
            <div className="report-metric-value">{reportData.missed_calls}</div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <h3 className="mb-3">Missed Call Details</h3>

          {reportData.missed_call_details.length === 0 && (
            <div className="alert alert-info text-center" role="alert">
              No missed calls found.
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Executive Name</th>
                  <th>Executive Id</th>
                  <th>User Name</th>
                  <th>Missed At</th>
                
                </tr>
              </thead>
              <tbody>
                {reportData.missed_call_details
                  .sort(
                    (a, b) => new Date(a.start_time) - new Date(b.start_time)
                  )
                  .map((call, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{index + 1}</td>
                      <td>{call.executive_name}</td>
                      <td>{call.executive_id}</td>
                      <td>{call.user_name}</td>
                      <td>{formatTime(call.missed_at)}</td>                     
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
