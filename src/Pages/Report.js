import React, { useEffect, useState, useMemo, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Report.css";
import { getFullReport } from "../services/allApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Report() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await getFullReport();
        console.log("Report Data:", data);
        
        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Memoized data calculations
  const periodData = useMemo(() => {
    if (!reportData) return {};

    const getExecutivesCount = () => {
      switch (selectedPeriod) {
        case 'today': return reportData.executives_today;
        case 'week': return reportData.executives_week;
        case 'month': return reportData.executives_month;
        case 'all': return reportData.total_executives;
        default: return reportData.total_executives;
      }
    };

    const getUsersCount = () => {
      switch (selectedPeriod) {
        case 'today': return reportData.users_today;
        case 'week': return reportData.users_week;
        case 'month': return reportData.users_month;
        case 'all': return reportData.total_users;
        default: return reportData.total_users;
      }
    };

    const getRevenue = () => {
      switch (selectedPeriod) {
        case 'today': return reportData.revenue_today;
        case 'week': return reportData.revenue_week;
        case 'month': return reportData.revenue_month;
        case 'all': return reportData.revenue_all_time;
        default: return reportData.revenue_all_time;
      }
    };

    const getCoinSales = () => {
      switch (selectedPeriod) {
        case 'today': return reportData.coin_sales_today;
        case 'week': return reportData.coin_sales_week;
        case 'month': return reportData.coin_sales_month;
        case 'all': return reportData.coin_sales_all_time;
        default: return reportData.coin_sales_all_time;
      }
    };

    return {
      executives: getExecutivesCount(),
      users: getUsersCount(),
      revenue: getRevenue(),
      coinSales: getCoinSales(),
      talkTime: selectedPeriod === 'today' ? reportData.today_talk_time : reportData.total_talk_time
    };
  }, [reportData, selectedPeriod]);

  // Memoized filtered missed calls
  const filteredMissedCalls = useMemo(() => {
    if (!reportData?.missed_call_details) return [];
    
    if (selectedPeriod === 'all') {
      return reportData.missed_call_details;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        cutoffDate.setTime(today.getTime());
        break;
      case 'week':
        cutoffDate.setTime(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate.setTime(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return reportData.missed_call_details;
    }

    return reportData.missed_call_details
      .filter(call => new Date(call.missed_at) >= cutoffDate)
      .sort((a, b) => new Date(b.missed_at) - new Date(a.missed_at));
  }, [reportData, selectedPeriod]);

  // Memoized format time function
  const formatTime = useCallback((timeString) => {
    return new Date(timeString).toLocaleString();
  }, []);

  // Download functions
  const downloadExcel = useCallback(() => {
    if (!reportData) return;

    const reportSummary = {
      'Time Period': selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1),
      'Total Executives': periodData.executives,
      'Total Users': periodData.users,
      'Revenue': periodData.revenue,
      'Coin Sales': periodData.coinSales,
      'Active Executives': reportData.active_executives,
      'Active Users': reportData.active_users,
      'On Call': reportData.on_call,
      'Talk Time': periodData.talkTime,
      'User Coin Spending': reportData.user_coin_spending,
      'Executive Earnings': reportData.executive_coin_earnings,
      'Missed Calls': filteredMissedCalls.length
    };

    const worksheet = XLSX.utils.json_to_sheet([reportSummary]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Summary");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(data, `Analytics_Report_${selectedPeriod}.xlsx`);
  }, [reportData, selectedPeriod, periodData, filteredMissedCalls.length]);

  const downloadMissedCallsExcel = useCallback(() => {
    if (!filteredMissedCalls.length) return;

    const missedCallsData = filteredMissedCalls.map((call, index) => ({
      'Serial No': index + 1,
      'Executive Name': call.executive_name,
      'Executive ID': call.executive_id,
      'User ID': call.id,
      'Missed At': formatTime(call.missed_at)
    }));

    const worksheet = XLSX.utils.json_to_sheet(missedCallsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Missed Calls");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(data, `Missed_Calls_Report_${selectedPeriod}.xlsx`);
  }, [filteredMissedCalls, selectedPeriod, formatTime]);

  if (loading) return <div className="text-center p-4"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (error) return <div className="alert alert-danger m-3">Error: {error}</div>;

  return (
    <div className="container-fluid report-container">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <h1 className="report-title mb-0">Analytics Report</h1>
            
            <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center">
              <select 
                className="form-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{ minWidth: '140px' }}
              >
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </select>
              
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary d-flex align-items-center gap-1"
                  onClick={downloadExcel}
                  disabled={!reportData}
                >
                  <i className="bi bi-file-earmark-excel"></i>
                  <span className="d-none d-sm-inline">Summary</span>
                </button>
                <button
                  className="btn btn-success d-flex align-items-center gap-1"
                  onClick={downloadMissedCallsExcel}
                  disabled={filteredMissedCalls.length === 0}
                >
                  <i className="bi bi-file-earmark-excel"></i>
                  <span className="d-none d-sm-inline">Missed Calls</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-total-executives">
            <h6><i className="bi bi-people me-1"></i>Total Executives</h6>
            <div className="report-metric-value">{periodData.executives}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-total-users">
            <h6><i className="bi bi-person me-1"></i>Total Users</h6>
            <div className="report-metric-value">{periodData.users}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-revenue">
            <h6><i className="bi bi-cash-coin me-1"></i>Revenue</h6>
            <div className="report-metric-value">{periodData.revenue}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-sales">
            <h6><i className="bi bi-coin me-1"></i>Coin Sales</h6>
            <div className="report-metric-value">{periodData.coinSales}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-active-executives">
            <h6><i className="bi bi-person-check me-1"></i>Active Executives</h6>
            <div className="report-metric-value">{reportData.active_executives}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-active-users">
            <h6><i className="bi bi-person-check me-1"></i>Active Users</h6>
            <div className="report-metric-value">{reportData.active_users}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-on-call">
            <h6><i className="bi bi-telephone me-1"></i>On Call</h6>
            <div className="report-metric-value">{reportData.on_call}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-talk-time">
            <h6><i className="bi bi-clock-history me-1"></i>Talk Time</h6>
            <div className="report-metric-value">{periodData.talkTime}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-spending">
            <h6><i className="bi bi-person me-1"></i>User Spending</h6>
            <div className="report-metric-value">{reportData.user_coin_spending}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-earnings">
            <h6><i className="bi bi-graph-up me-1"></i>Executive Earnings</h6>
            <div className="report-metric-value">{reportData.executive_coin_earnings}</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="report-metric-card report-missed">
            <h6><i className="bi bi-telephone-x me-1"></i>Missed Calls</h6>
            <div className="report-metric-value">{filteredMissedCalls.length}</div>
          </div>
        </div>
      </div>

     <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Missed Call Details ({selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)})</h3>
            <span className="badge bg-primary fs-6">
              Total: {filteredMissedCalls.length}
            </span>
          </div>

          {filteredMissedCalls.length === 0 && (
            <div className="alert alert-info text-center" role="alert">
              No missed calls found for the selected time period.
            </div>
          )}

          {filteredMissedCalls.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Executive Name</th>
                    <th>Executive Id</th>
                    <th>User Id</th>
                    <th>Missed At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMissedCalls
                    .sort(
                      (a, b) => new Date(b.missed_at) - new Date(a.missed_at)
                    )
                    .map((call, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{index + 1}</td>
                        <td>{call.executive_name}</td>
                        <td>{call.executive_id}</td>
                       
                         <td>{call.id}</td>
                        <td>{formatTime(call.missed_at)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Report;