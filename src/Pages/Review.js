import * as React from 'react';
import './Report.css';
import { useState, useEffect } from 'react';
import { getTotalRating } from '../services/allApi';
import * as XLSX from 'xlsx';

export default function Review() {
    const [ratings, setRatings] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [filterStars, setFilterStars] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showMessage, setShowMessage] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');
    
    const itemsPerPage = 15;

    const filteredRatings = filterStars === ''
        ? ratings
        : ratings.filter((rating) => {
            const stars = rating.stars;
            switch (filterStars) {
                case "5": return stars === 5;
                case "4": return stars === 4;
                case "3": return stars === 3;
                case "2": return stars === 2;
                case "1": return stars === 1;
                default: return true;
            }
        });

    const formatDuration = (duration) => {
        if (!duration || typeof duration !== 'string' || !duration.includes(':')) {
            return '-';
        }
        try {
            const [hours, minutes, seconds] = duration.split(':');
            const [wholeSeconds] = seconds.split('.');
            return `${parseInt(hours, 10)}:${parseInt(minutes, 10)}:${parseInt(wholeSeconds, 10)}`;
        } catch (error) {
            return '-';
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN', { hour12: false });
    };

    const exportToExcel = () => {
        try {
            const exportData = filteredRatings.map((rating, index) => ({
                'SI NO': index + 1,
                'ID': rating.id || '-',
                'Rating': rating.stars || 0,
                'User': rating.user_id || '-',
                'Executive': rating.executive_id || '-',
                'Message': rating.comment || '-',
                'Duration': formatDuration(rating.duration),
                'Date': formatDate(rating.created_at)
            }));

            
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            
            const columnWidths = [
                { wch: 8 }, 
                { wch: 10 }, // ID
                { wch: 10 }, // Rating
                { wch: 15 }, // User
                { wch: 15 }, // Executive
                { wch: 30 }, // Message
                { wch: 12 }, // Duration
                { wch: 20 }  // Date
            ];
            worksheet['!cols'] = columnWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews');

            // Generate filename with current date
            const currentDate = new Date().toISOString().split('T')[0];
            const filename = `reviews_export_${currentDate}.xlsx`;

            // Save file
            XLSX.writeFile(workbook, filename);
            
            // console.log('Excel file exported successfully');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Error exporting data. Please try again.');
        }
    };

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await getTotalRating();
                // console.log(response);
                
                const allRatings = response.reduce((acc, user) => {
                    if (user.ratings && Array.isArray(user.ratings)) {
                        return [...acc, ...user.ratings];
                    }
                    return acc;
                }, []);

                const sortedRatings = allRatings.sort((a, b) => {
                    return new Date(b.created_at) - new Date(a.created_at);
                });

                setRatings(sortedRatings);
            } catch (error) {
                console.error("Error fetching ratings:", error);
                setRatings([]);
            }
        };

        fetchRatings();
    }, []);

    const totalPages = Math.ceil(filteredRatings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredRatings.slice(startIndex, startIndex + itemsPerPage);

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const viewMessage = (message) => {
        setSelectedMessage(message || 'No message');
        setShowMessage(true);
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '20px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#333', fontWeight: '300', margin: '0' }}>Reviews</h2>
            </div>

            {/* Controls */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                padding: '0 10px'
            }}>
                <span style={{ color: '#666', fontSize: '14px' }}>
                    Total: {filteredRatings.length} reviews
                </span>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {showFilter && (
                        <select 
                            value={filterStars} 
                            onChange={(e) => setFilterStars(e.target.value)}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">All Stars</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    )}
                    
                    <button 
                        onClick={() => setShowFilter(!showFilter)}
                        style={{
                            backgroundColor: showFilter ? '#f0f0f0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Filter
                    </button>

                    <button 
                        onClick={exportToExcel}
                        disabled={filteredRatings.length === 0}
                        style={{
                            backgroundColor: filteredRatings.length === 0 ? '#f0f0f0' : '#28a745',
                            color: filteredRatings.length === 0 ? '#999' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: filteredRatings.length === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                        title={filteredRatings.length === 0 ? 'No data to export' : 'Export to Excel'}
                    >
                        📊 Export Excel
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={{ 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0', 
                borderRadius: '6px',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#555', borderBottom: '1px solid #e0e0e0' }}>SI NO</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#555', borderBottom: '1px solid #e0e0e0' }}>ID</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#555', borderBottom: '1px solid #e0e0e0' }}>Rating</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#555', borderBottom: '1px solid #e0e0e0' }}>User</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#555', borderBottom: '1px solid #e0e0e0' }}>Executive</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#555', borderBottom: '1px solid #e0e0e0' }}>Message</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#555', borderBottom: '1px solid #e0e0e0' }}>Duration</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#555', borderBottom: '1px solid #e0e0e0' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ 
                                    padding: '40px', 
                                    textAlign: 'center', 
                                    color: '#999',
                                    fontSize: '16px'
                                }}>
                                    No reviews found
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((rating, index) => (
                                <tr key={index} style={{ 
                                    borderBottom: '1px solid #f0f0f0',
                                    ':hover': { backgroundColor: '#f9f9f9' }
                                }}>
                                    <td style={{ padding: '12px', color: '#333' }}>{startIndex + index + 1}</td>
                                    <td style={{ padding: '12px', color: '#333' }}>{rating.id}</td>
                                    <td style={{ padding: '12px', color: '#ff6b35', fontSize: '16px' }}>
                                        {renderStars(rating.stars)}
                                    </td>
                                    <td style={{ padding: '12px', color: '#333' }}>{rating.user_id}</td>
                                    <td style={{ padding: '12px', color: '#333' }}>{rating.executive_id}</td>
                                    <td style={{ padding: '12px', color: '#333' }}>
                                        {rating.comment ? (
                                            rating.comment.length > 40 ? (
                                                <span>
                                                    {rating.comment.substring(0, 40)}...
                                                    <button 
                                                        onClick={() => viewMessage(rating.comment)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#007bff',
                                                            cursor: 'pointer',
                                                            marginLeft: '5px',
                                                            textDecoration: 'underline'
                                                        }}
                                                    >
                                                        view
                                                    </button>
                                                </span>
                                            ) : rating.comment
                                        ) : '-'}
                                    </td>
                                    <td style={{ padding: '12px', color: '#666', fontFamily: 'monospace' }}>
                                        {formatDuration(rating.duration)}
                                    </td>
                                    <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                                        {formatDate(rating.created_at)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    marginTop: '20px',
                    gap: '10px'
                }}>
                    <button 
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        First
                    </button>
                    
                    <button 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        Previous
                    </button>
                    
                    <span style={{ 
                        padding: '6px 12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}>
                        {currentPage} of {totalPages}
                    </span>
                    
                    <button 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                    >
                        Next
                    </button>
                    
                    <button 
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                    >
                        Last
                    </button>
                </div>
            )}

            {/* Message Modal */}
            {showMessage && (
                <div style={{ 
                    position: 'fixed', 
                    top: '0', 
                    left: '0', 
                    right: '0', 
                    bottom: '0', 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px', 
                        padding: '20px', 
                        maxWidth: '500px', 
                        width: '90%',
                        maxHeight: '70vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '15px'
                        }}>
                            <h3 style={{ margin: '0', color: '#333', fontSize: '18px' }}>Message</h3>
                            <button 
                                onClick={() => setShowMessage(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#999'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ color: '#333', lineHeight: '1.5', margin: '0' }}>
                            {selectedMessage}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}