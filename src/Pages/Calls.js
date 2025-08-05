import React, { useEffect, useState } from "react";
import { getAllCalls } from "../services/allApi";
import { Spinner, Table, Pagination } from "react-bootstrap";
import { BASE_URL } from "../services/baseUrl";

function Calls() {
  const [allCalls, setAllCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
  });

  const fetchCalls = async (url = null) => {
    try {
      setLoading(true);
      const data = await getAllCalls(url);
      console.log(data);

      setAllCalls(data.results);
      
      // Calculate total pages - with 1125 records and you're on page 113 with no next page
      // This means 1125 / 113 ≈ 10 results per page (standard pagination)
      const resultsPerPage = 10; // Most APIs use 10, 20, 25, or 50 per page
      const totalPages = Math.ceil(data.count / resultsPerPage) || 1;
      
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
        currentPage: url ? 
          (url.includes('page=') ? parseInt(url.split('page=')[1]) : 1) : 1,
        totalPages: totalPages
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const handlePageChange = (url) => {
    fetchCalls(url);
  };

  // Generate pagination items with proper logic for showing pages between first 3 and last 3
const generatePaginationItems = () => {
  const { currentPage, totalPages } = pagination;
  const items = [];
 
  const edgePageCount = 2; 

  // Always show first edge pages
  for (let i = 1; i <= edgePageCount; i++) {
    items.push(createPageItem(i));
  }

  // Determine if we need left ellipsis
  if (currentPage > edgePageCount + 2) {
    items.push(<Pagination.Ellipsis key="left-ellipsis" disabled />);
  }

  // Show current page and neighbors
  const middleStart = Math.max(edgePageCount + 1, currentPage - 1);
  const middleEnd = Math.min(totalPages - edgePageCount, currentPage + 1);
  
  for (let i = middleStart; i <= middleEnd; i++) {
    if (i > edgePageCount && i <= totalPages - edgePageCount) {
      items.push(createPageItem(i));
    }
  }

  // Determine if we need right ellipsis
  if (currentPage < totalPages - edgePageCount - 1) {
    items.push(<Pagination.Ellipsis key="right-ellipsis" disabled />);
  }

  // Always show last edge pages
  for (let i = totalPages - edgePageCount + 1; i <= totalPages; i++) {
    if (i > edgePageCount) { // Avoid duplicates
      items.push(createPageItem(i));
    }
  }

  return items;

  function createPageItem(pageNumber) {
    return (
      <Pagination.Item
        key={pageNumber}
        active={pageNumber === currentPage}
        onClick={() => {
          const pageUrl = `${BASE_URL}/api/view-call-history/?page=${pageNumber}`;
          handlePageChange(pageUrl);
        }}
      >
        {pageNumber}
      </Pagination.Item>
    );
  }
};

  if (loading && allCalls.length === 0) {
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
    <div className="p-3">
      <Table hover responsive="sm" className="request-table">
        <thead>
          <tr>
            <th>Executive</th>
            <th>User ID</th>
            <th>Start Time</th>
            <th>Duration</th>
            <th>Coin Deducted</th>
            <th>End Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td colSpan="7" className="text-center text-danger fw-bold">
                {error}
              </td>
            </tr>
          ) : allCalls.length > 0 ? (
            allCalls.map((item, index) => (
              <tr key={index}>
                <td>{item.executive?.name || "N/A"}</td>
                <td>{item.user?.user_id || "N/A"}</td>
                <td>{item.formatted_start_time || "N/A"}</td>
                <td>{item.formatted_duration || "N/A"}</td>
                <td>{item.coins_deducted || "N/A"}</td>
                <td>{item.formatted_end_time || "N/A"}</td>
                <td>
                  <span className={`badge ${
                    item.status === 'completed' ? 'bg-success' : 
                    item.status === 'failed' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {item.status || "N/A"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No call history found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination>
            <Pagination.Prev 
              disabled={!pagination.previous} 
              onClick={() => handlePageChange(pagination.previous)} 
            />
            {generatePaginationItems()}
            <Pagination.Next 
              disabled={!pagination.next} 
              onClick={() => handlePageChange(pagination.next)} 
            />
          </Pagination>
        </div>
      )}

      <div className="mt-2 text-muted text-center">
        Showing {allCalls.length} records (Page {pagination.currentPage} of {pagination.totalPages})
      </div>
    </div>
  );
}

export default Calls;