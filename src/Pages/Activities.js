import React, { useState, useEffect } from 'react';
import { Pagination, Table, Modal, Button, Spinner } from 'react-bootstrap';
import { getRunningcalls } from '../services/allApi';
import AgoraRTC from "agora-rtc-sdk-ng";

function Activities() {
  const [allCalls, setAllCalls] = useState([]); 
  const [calls, setCalls] = useState([]); 
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  
  const client = AgoraRTC.createClient({
    mode: "live",
    codec: "vp8",
    region: "asia", 
  });  
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState(new Map()); 

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };


  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await getRunningcalls();
        console.log(data, "ongoing");

        if (data && Array.isArray(data)) {
          setAllCalls(data);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCalls();

    // Set polling interval
    const interval = setInterval(() => {
      fetchCalls();
    }, 5000); // Fetch every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [itemsPerPage]);


  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCalls(allCalls.slice(startIndex, endIndex)); // Slice data for the current page
  }, [page, allCalls, itemsPerPage]);

  if (error) {
    return <div className="text-danger">Error: {error}</div>;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const handleHearCall = async (channel_name, token, uid) => {
    try {
      console.log("Using existing UID:", uid);
      console.log("Channel Name:", channel_name);
  
      setChannelInfo({ channel_name, token, uid });
      setShowModal(true);
  
      // Leave any existing channel to prevent conflicts
      if (client && client.connectionState === "CONNECTED") {
        console.log("Leaving previous channel...");
        await client.leave();
      }
  
      // Join the Agora channel
      await client.join(process.env.REACT_APP_AGORA_APP_ID, channel_name, token, uid);
  
      // Listen for user-published events
      client.on("user-published", async (user, mediaType) => {
        if (mediaType === "audio") {
          try {
            const audioTrack = await client.subscribe(user, "audio");
            setRemoteAudioTracks((prevTracks) => {
              const newTracks = new Map(prevTracks);
              newTracks.set(user.uid, audioTrack);
              return newTracks;
            });
            console.log(`Subscribed to audio of user: ${user.uid}`);
          } catch (err) {
            console.error("Error subscribing to user audio: ", err);
          }
        }
      });
  
      client.on("user-unpublished", (user) => {
        console.log(`User ${user.uid} left the channel`);
        setRemoteAudioTracks((prevTracks) => {
          const newTracks = new Map(prevTracks);
          newTracks.delete(user.uid);
          return newTracks;
        });
      });
    } catch (error) {
      if (error.message.includes("UID_CONFLICT")) {
        console.error("UID conflict detected. Please ensure the user has left the previous session.");
      } else {
        console.error("Error joining channel: ", error.message);
      }
    }
  };
  
  // Handle Playing All Audio Tracks
  const handlePlayAudio = () => {
    if (remoteAudioTracks.size > 0) {
      remoteAudioTracks.forEach((track, uid) => {
        console.log(`Playing audio for user: ${uid}`);
        track.play();
      });
      setIsAudioPlaying(true);
    }
  };
  

  const handleModalClose = async () => {
    try {
      setShowModal(false);
  
      // Stop and reset all remote audio tracks
      if (remoteAudioTracks && remoteAudioTracks.size > 0) {
        remoteAudioTracks.forEach((track, uid) => {
          console.log(`Stopping audio for user: ${uid}`);
          track.stop(); // Stop each individual track
        });
        setRemoteAudioTracks(new Map()); // Clear the tracks
        setIsAudioPlaying(false);
      }
  
      // Ensure the client leaves the channel
      if (client && client.connectionState === "CONNECTED") {
        await client.leave();
        console.log("Left the channel");
      }
  
      // Clean up event listeners to avoid duplication
      client.removeAllListeners();
  
      // Reset channel info
      setChannelInfo(null);
    } catch (error) {
      console.error("Error during cleanup:", error.message);
    }
  };
  
  
  
  
  

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="container mt-4">
      <div style={{ background: 'white', borderRadius: '10px' }}>
        <p className="ms-4 mt-3 d-flex justify-content-between align-items-center emlist">
          Running Calls
        </p>
        <Table hover responsive="sm" className="request-table">
          <thead>
            <tr>
              <th>Executive</th>
              <th>User ID</th>
              <th>Start Time</th>
              <th>Duration</th>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            {calls.length > 0 ? (
              calls.map((item, index) => (
                <tr key={index}>
                  <td>{item.executive_name}</td>
                  <td>{item.user_id}</td>
                  <td>{formatTime(item.start_time)}</td>
                  <td>{item.duration_minutes + ' Mns'}</td>
                  <td>
                  <td>
                  <button
                    className="Hear-Call"
                    onClick={() =>
                      handleHearCall(item.channel_name, item.token ,item.executive_id)
                    }
                  >
                    Hear Call
                  </button>
                </td>
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No running calls available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Updated Pagination */}
      <Pagination className="justify-content-center mt-4">
  <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
  <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
  
  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => {
    // Logic for showing ellipsis
    if (
      pageNum === 1 || // Always show the first page
      pageNum === totalPages || // Always show the last page
      (pageNum >= page - 1 && pageNum <= page + 1) // Show current page and neighbors
    ) {
      return (
        <Pagination.Item
          key={pageNum}
          active={page === pageNum}
          onClick={() => handlePageChange(pageNum)}
          style={{
            backgroundColor: page === pageNum ? '#5065F6' : 'transparent',
            color: page === pageNum ? 'white' : '#000',
            borderRadius: '8px',
            boxShadow: page === pageNum
              ? '0px -1px 1px 0px #00000026 inset, 0px 2px 6px 0px #5065F642'
              : 'none',
            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
          }}
        >
          {pageNum}
        </Pagination.Item>
      );
    } else if (
      (pageNum === page - 2 && page > 4) || // Ellipsis before current range
      (pageNum === page + 2 && page < totalPages - 3) // Ellipsis after current range
    ) {
      return <Pagination.Ellipsis key={`ellipsis-${pageNum}`} disabled />;
    }
    return null;
  })}
  
  <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
</Pagination>

<Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Hearing Call</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are now connected to the channel:{" "}
            <strong>{channelInfo?.channel_name}</strong>
          </p>
          <p>
            {remoteAudioTracks
              ? "Click the 'Play Audio' button to start hearing the call."
              : "Waiting for audio stream..."}
          </p>
          {!isAudioPlaying && remoteAudioTracks && (
            <Button variant="primary" onClick={handlePlayAudio}>
              Play Audio
            </Button>
          )}
          {isAudioPlaying && <p>Audio is playing. Adjust your speaker volume if needed.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Activities;  