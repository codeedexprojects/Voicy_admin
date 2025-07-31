import React, { useState, useEffect } from "react";
import {
  Pagination,
  Table,
  Modal,
  Button,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { getRunningcalls, TerminateCall } from "../services/allApi";
import AgoraRTC from "agora-rtc-sdk-ng";

function Activities() {
  const [allCalls, setAllCalls] = useState([]);
  const [calls, setCalls] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);

  // Terminate call specific states
  const [terminateLoading, setTerminateLoading] = useState(false);
  const [selectedCallForTermination, setSelectedCallForTermination] =
    useState(null);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success"); // 'success', 'danger', 'warning', 'info'

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

  // Toast helper function
  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await getRunningcalls();
        console.log("fetched",data)

        if (data && Array.isArray(data)) {
          setAllCalls(data);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        setError(err.message);
        showToastMessage(`Error fetching calls: ${err.message}`, "danger");
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCalls();

    // Set polling interval
    const interval = setInterval(() => {
      fetchCalls();
    }, 1000); // Fetch every 1 second

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
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  
  const handleHearCall = async (channel_name, token, uid) => {
    try {
      setChannelInfo({ channel_name, token, uid });
      setShowModal(true);

      // Leave any existing channel to prevent conflicts
      if (client && client.connectionState === "CONNECTED") {
        await client.leave();
        // Clear existing tracks when leaving
        remoteAudioTracks.forEach((track) => track.stop());
        setRemoteAudioTracks(new Map());
        setIsAudioPlaying(false);
      }

      // Join the Agora channel
      await client.join(
        process.env.REACT_APP_AGORA_APP_ID,
        channel_name,
        token,
        uid
      );
      console.log(`Joined channel: ${channel_name} with UID: ${uid}`);

      // Enable audio volume indication to detect active speakers
      await client.enableAudioVolumeIndicator();

      // Listen for all user-published events (both executive and user)
      client.on("user-published", async (user, mediaType) => {
        if (mediaType === "audio") {
          try {
            console.log(`User ${user.uid} published audio`);
            const audioTrack = await client.subscribe(user, "audio");

            setRemoteAudioTracks((prevTracks) => {
              const newTracks = new Map(prevTracks);
              newTracks.set(user.uid, audioTrack);
              return newTracks;
            });

            // Automatically play new audio tracks if audio is already playing
            if (isAudioPlaying) {
              audioTrack.play();
            }

            showToastMessage(
              `Connected to audio from user ${user.uid}`,
              "info"
            );
          } catch (err) {
            console.error("Error subscribing to audio:", err);
            showToastMessage(
              `Error connecting to user ${user.uid}'s audio`,
              "danger"
            );
          }
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio") {
          console.log(`User ${user.uid} unpublished audio`);
          setRemoteAudioTracks((prevTracks) => {
            const newTracks = new Map(prevTracks);
            const track = newTracks.get(user.uid);
            if (track) {
              track.stop();
            }
            newTracks.delete(user.uid);
            return newTracks;
          });
          showToastMessage(`User ${user.uid} disconnected`, "warning");
        }
      });

      // Listen for user-joined events (just for information)
      client.on("user-joined", (user) => {
        console.log(`User ${user.uid} joined`);
        showToastMessage(`User ${user.uid} joined the channel`, "info");
      });

      // Listen for user-left events
      client.on("user-left", (user) => {
        console.log(`User ${user.uid} left`);
        setRemoteAudioTracks((prevTracks) => {
          const newTracks = new Map(prevTracks);
          const track = newTracks.get(user.uid);
          if (track) {
            track.stop();
          }
          newTracks.delete(user.uid);
          return newTracks;
        });
        showToastMessage(`User ${user.uid} left the channel`, "warning");
      });

      showToastMessage("Successfully connected to the call", "success");
    } catch (error) {
      console.error("Error in handleHearCall:", error);
      if (error.message.includes("UID_CONFLICT")) {
        showToastMessage("UID conflict detected. Please try again.", "warning");
      } else {
        showToastMessage(`Error joining channel: ${error.message}`, "danger");
      }
    }
  };

  // Handle Playing All Audio Tracks
  const handlePlayAudio = () => {
    if (remoteAudioTracks.size > 0) {
      remoteAudioTracks.forEach((track, uid) => {
        if (isAudioPlaying) {
          track.stop();
        } else {
          track.play();
        }
      });
      setIsAudioPlaying(!isAudioPlaying);
      showToastMessage(
        isAudioPlaying ? "Audio stopped" : "Audio playback started",
        "info"
      );
    } else {
      showToastMessage("No audio tracks available to play", "warning");
    }
  };

  const handleModalClose = async () => {
    try {
      setShowModal(false);

      // Stop and reset all remote audio tracks
      if (remoteAudioTracks && remoteAudioTracks.size > 0) {
        remoteAudioTracks.forEach((track, uid) => {
          track.stop(); // Stop each individual track
        });
        setRemoteAudioTracks(new Map()); // Clear the tracks
        setIsAudioPlaying(false);
      }

      // Ensure the client leaves the channel
      if (client && client.connectionState === "CONNECTED") {
        await client.leave();
      }

      // Clean up event listeners to avoid duplication
      client.removeAllListeners();

      // Reset channel info
      setChannelInfo(null);
      showToastMessage("Disconnected from the call", "info");
    } catch (error) {
      showToastMessage(`Error during cleanup: ${error.message}`, "danger");
    }
  };

  // Handle terminate call button click
  const handleTerminateCallClick = (callItem) => {
    setSelectedCallForTermination(callItem);
    setShowTerminateModal(true);
  };

  // Handle terminate call confirmation
  const handleTerminateCall = async () => {
    if (!selectedCallForTermination) {
      showToastMessage("No call selected for termination", "warning");
      return;
    }

    setTerminateLoading(true);

    try {
      const response = await TerminateCall(
        selectedCallForTermination.executive_id
      );

      if (response && response.status === 200) {
        showToastMessage(
          `Call terminated successfully for ${selectedCallForTermination.executive_name}`,
          "success"
        );

        // Remove the terminated call from the current calls list
        setAllCalls((prevCalls) =>
          prevCalls.filter(
            (call) =>
              call.executive_id !== selectedCallForTermination.executive_id
          )
        );

        // Close the modal and reset states
        handleTerminateModalClose();

        // Optionally refresh the calls list
        // You might want to refetch the data here if needed
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      let errorMessage = "Failed to terminate call";

      if (error.response) {
        // Server responded with an error status
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Network error - please check your connection";
      } else {
        // Something else happened
        errorMessage = error.message || "Unknown error occurred";
      }

      showToastMessage(errorMessage, "danger");
    } finally {
      setTerminateLoading(false);
    }
  };

  // Handle terminate modal close
  const handleTerminateModalClose = () => {
    setShowTerminateModal(false);
    setSelectedCallForTermination(null);
    setTerminateLoading(false);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return date.toLocaleString("en-US", options);
  };

  return (
    <div className="container mt-4">
      {/* Toast Container */}
      <ToastContainer className="p-3" position="top-end">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === "success" && "Success"}
              {toastVariant === "danger" && "Error"}
              {toastVariant === "warning" && "Warning"}
              {toastVariant === "info" && "Info"}
            </strong>
          </Toast.Header>
          <Toast.Body
            className={
              toastVariant === "success" || toastVariant === "danger"
                ? "text-white"
                : ""
            }
          >
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div style={{ background: "white", borderRadius: "10px" }}>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.length > 0 ? (
              calls.map((item, index) => (
                <tr key={index}>
                  <td>{item.executive_name}</td>
                  <td>{item.user_id}</td>
                  <td>{formatTime(item.start_time)}</td>
                  <td>{item.duration_minutes + " Mns"}</td>
                  <td>
                    <button
                      className="Hear-Call"
                      onClick={() =>
                        handleHearCall(
                          item.channel_name,
                          item.token,
                          item.executive_id
                        )
                      }
                    >
                      Hear Call
                    </button>
                    <button
                      className="Hear-Call ms-3"
                      style={{
                        backgroundColor: "#dc3545",
                        borderColor: "#dc3545",
                      }}
                      onClick={() => handleTerminateCallClick(item)}
                    >
                      Terminate Call
                    </button>
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
        <Pagination.First
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
        />
        <Pagination.Prev
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        />

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNum) => {
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
                    backgroundColor:
                      page === pageNum ? "#5065F6" : "transparent",
                    color: page === pageNum ? "white" : "#000",
                    borderRadius: "8px",
                    boxShadow:
                      page === pageNum
                        ? "0px -1px 1px 0px #00000026 inset, 0px 2px 6px 0px #5065F642"
                        : "none",
                    transition:
                      "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
                  }}
                >
                  {pageNum}
                </Pagination.Item>
              );
            } else if (
              (pageNum === page - 2 && page > 4) || // Ellipsis before current range
              (pageNum === page + 2 && page < totalPages - 3) // Ellipsis after current range
            ) {
              return (
                <Pagination.Ellipsis key={`ellipsis-${pageNum}`} disabled />
              );
            }
            return null;
          }
        )}

        <Pagination.Next
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        />
        <Pagination.Last
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
        />
      </Pagination>

      {/* Hear Call Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Hearing Call</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are now connected to the channel:{" "}
            <strong>{channelInfo?.channel_name}</strong>
          </p>

          <div className="mb-3">
            <h6>Active Participants:</h6>
            {remoteAudioTracks.size > 0 ? (
              <ul>
                {Array.from(remoteAudioTracks.entries()).map(([uid, track]) => (
                  <li key={uid}>
                    {uid === channelInfo?.uid ? "Executive" : "User"} {uid}
                    {isAudioPlaying && " (Playing)"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Waiting for participants to join...</p>
            )}
          </div>

          {remoteAudioTracks.size > 0 && (
            <div className="d-flex gap-2">
              <Button
                variant={isAudioPlaying ? "danger" : "success"}
                onClick={handlePlayAudio}
              >
                {isAudioPlaying ? "Stop All Audio" : "Play All Audio"}
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => {
                  // Toggle mute for specific users if needed
                }}
              >
                Mute Controls
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Terminate Call Modal */}
      <Modal
        show={showTerminateModal}
        onHide={handleTerminateModalClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Terminate Call</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to terminate the ongoing call?</p>
          {selectedCallForTermination && (
            <div
              className="mt-3 p-3"
              style={{ backgroundColor: "#f8f9fa", borderRadius: "5px" }}
            >
              <strong>Call Details:</strong>
              <br />
              <span>
                Executive: {selectedCallForTermination.executive_name}
              </span>
              <br />
              <span>User ID: {selectedCallForTermination.user_id}</span>
              <br />
              <span>
                Duration: {selectedCallForTermination.duration_minutes} minutes
              </span>
            </div>
          )}
          <div className="mt-3 text-danger">
            <small>
              ⚠️ This action cannot be undone. The call will be permanently
              terminated.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleTerminateModalClose}
            disabled={terminateLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleTerminateCall}
            disabled={terminateLoading}
          >
            {terminateLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Terminating...
              </>
            ) : (
              "Yes, Terminate"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Activities;
