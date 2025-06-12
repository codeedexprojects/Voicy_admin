import * as React from 'react';
import Box from '@mui/material/Box';
import SortIcon from '@mui/icons-material/Sort';
import './Report.css';
import { Pagination, Modal, Button } from 'react-bootstrap';
import { useState,useEffect } from 'react';
import Popover from '@mui/material/Popover';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import { getTotalRating } from '../services/allApi';


export default function Review() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [expandedModalOpen, setExpandedModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');
    const [ratings, setRatings] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterStars, setFilterStars] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const handleFilterBtnClick = () => {
      setShowFilterModal(true);
    };
  
    const applyFilters = () => {
      setShowFilterModal(false);
    };
  
    const filteredRatings =
    filterStars === null
      ? ratings
      : ratings.filter((rating) => {
          const stars = rating.stars;
          switch (filterStars) {
            case "4-5":
              return stars >= 4 && stars <= 5;
            case "3-4":
              return stars >= 3 && stars < 4;
            case "2-3":
              return stars >= 2 && stars < 3;
            case "1-2":
              return stars >= 1 && stars < 2;
            case "0-1":
              return stars >= 0 && stars < 1;
            default:
              return true;
          }
        });
        const formatDuration = (duration) => {
          // Check for null, undefined, or invalid input
          if (!duration || typeof duration !== 'string' || !duration.includes(':')) {
            return 'N/A';
          }
        
          try {
            // Split the duration string into its components
            const [hours, minutes, seconds] = duration.split(':');
        
            // Extract the integer part of seconds
            const [wholeSeconds] = seconds.split('.');
        
            // Return formatted string
            return `${parseInt(hours, 10)}h ${parseInt(minutes, 10)}m ${parseInt(wholeSeconds, 10)}s`;
          } catch (error) {
            // Handle unexpected errors
            return 'N/A';
          }
        };
    const extractTime = (isoString) => 
        new Date(isoString).toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });
  
    const handleMoreOptionsClick = (event, message) => {
        setAnchorEl(event.currentTarget);
        setSelectedMessage(message);
    };
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await getTotalRating(); 
                console.log("API Response:", response.data); 
    
                // Extract, combine, and sort ratings by time (latest first)
                const allRatings = response.reduce((acc, user) => {
                    if (user.ratings && Array.isArray(user.ratings)) {
                        return [...acc, ...user.ratings];
                    }
                    return acc;
                }, []);
    
                const sortedRatings = allRatings.sort((a, b) => {
                    const dateA = new Date(a.created_at);
                    const dateB = new Date(b.created_at);
                    return dateB - dateA; 
                });
    
                setRatings(sortedRatings); 
            } catch (error) {
                console.error("Error fetching ratings:", error);
                setRatings([]); 
            }
        };
    
        fetchRatings(); 
    }, []);
    
    
    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handleViewClick = () => {
        setExpandedModalOpen(true);
        handlePopoverClose(); 
    };

    const handleExpandedModalClose = () => {
        setExpandedModalOpen(false);
    };
    const totalPages = Math.ceil(filteredRatings.length / itemsPerPage);

    // Get the current page items
    const currentItems = filteredRatings.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  
    // Handle page change
    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };


    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                }}
            >
                <h4>Review</h4>
            </Box>

            <div className="filter-icon-hold p-3">
                <button className="sort-icon-container">
                    <SortIcon className="sort-icon" onClick={handleFilterBtnClick} />
                </button>
            </div>

            <div className="row p-3">
  {currentItems.length === 0 ? (
    <div className="col-12">
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#757B82' }}>
        No ratings available.
      </p>
    </div>
  ) : (
    currentItems.map((rating, index) => (
      <div className="col-md-3 col-12 mb-3" key={index}>
        <MDBCard className="h-100">
          <MDBCardBody>
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ marginBottom: '0.5rem' }}
            >
              <p style={{ fontSize: '18px', marginBottom: '0' }}>{rating.id}</p>
              <div>
                <span onClick={(e) => handleMoreOptionsClick(e, rating.comment)}
                  style={{
                    cursor: 'pointer',
                   
                    fontSize: '18px',
                    color: 'black',
                  }}
                >
                  &#8942;
                </span>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <div>
                <p style={{ marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '12px', color: '#757B82' }}>Rating</span>
                </p>
                <p style={{ fontSize: '14px', marginBottom: '0.5rem' }}>{rating.stars}</p>
                <p style={{ marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '12px', color: '#757B82' }}>User ID</span>
                </p>
                <p style={{ fontSize: '14px', marginBottom: '0.5rem' }}>{rating.user}</p>
                <p style={{ marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '12px', color: '#757B82' }}>Message</span>
                </p>
                {rating.comment ? 
    (rating.comment.length > 30 ? `${rating.comment.substring(0, 30)}...` : rating.comment)
    : 'N/A'}              </div>
              <div>
                <p style={{ marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '12px', color: '#757B82' }}>Time</span>
                </p>
                <p style={{ fontSize: '14px', marginBottom: '0.5rem' }}>
                  {extractTime(rating.created_at)}
                </p>
                <p style={{ marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '12px', color: '#757B82' }}>Executive ID</span>
                </p>
                <p style={{ fontSize: '14px', marginBottom: '0.5rem' }}>{rating.executive}</p>
                <p style={{ marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '12px', color: '#757B82' }}>Call Duration</span>
                </p>
                <p style={{ fontSize: '14px', marginBottom: '0.5rem' }}>{formatDuration(rating.duration)}</p>
              </div>
            </div>
          </MDBCardBody>
        </MDBCard>
      </div>
    ))
  )}
</div>

            {/* Popover for More Options */}
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Button variant="light" onClick={handleViewClick}>
                        View
                    </Button>
                    <br />
                    <Button variant="light" onClick={() => alert('Delete clicked')}>
                        Delete
                    </Button>
                    <br />
                    <Button variant="light" onClick={() => alert('Report Profile clicked')}>
                        Report Profile
                    </Button>
                </Box>
            </Popover>

            {/* Expanded View Modal */}
            <Modal show={expandedModalOpen} onHide={handleExpandedModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Expanded Message View</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {selectedMessage ? <p>{selectedMessage}</p> : "N/A"}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleExpandedModalClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            {showFilterModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Filter Ratings</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFilterModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Stars</label>
                  <select
                    className="form-select"
                    value={filterStars || ""}
                    onChange={(e) => setFilterStars(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="4-5">4-5 Stars</option>
                    <option value="3-4">3-4 Stars</option>
                    <option value="2-3">2-3 Stars</option>
                    <option value="1-2">1-2 Stars</option>
                    <option value="0-1">0-1 Stars</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setFilterStars(null);
                    setShowFilterModal(false);
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={applyFilters}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            <div className="pagination-div">
        <Pagination className="justify-content-center mt-4">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Pagination.Item
                key={pageNumber}
                active={pageNumber === currentPage}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Pagination.Item>
            )
          )}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>

            <br />
        </>
    );
}
