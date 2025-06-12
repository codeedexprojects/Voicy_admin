import React, { useEffect, useState } from "react";
import { MDBIcon, MDBInput } from "mdb-react-ui-kit";
import "./AddExecutive.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../services/baseUrl";
import { getAdmins } from "../services/allApi";

function AddExecutive({ setShowExecutiveModal }) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    place: "",
    profession: "",
    gender: "",
    executive_id: "",
    email_id: "",
    age: "",
    education_qualification: "",
    skills: "",
    status: "",
    password: "",
    is_banned: false,
    is_suspended: false,
    manager_executive: "", // Added manager_id to the state
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "manager_executive" ? Number(value) : value, 
    }));
  };

  const handleCancel = () => {
    setShowExecutiveModal(false);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const requiredFields = {
    name: "Executive Name",
    mobile_number: "Phone Number",
    email_id: "Email ID",
    password: "Password",
    gender: "Gender",
    status: "Status",
    manager_executive: "Manager", // Required field
  };

  const missingFields = Object.keys(requiredFields).filter(
    (field) =>
      !formData[field] ||
      (typeof formData[field] === "string" && formData[field].trim() === "")
  );

  if (missingFields.length > 0) {
    const missingFieldNames = missingFields
      .map((field) => requiredFields[field])
      .join(", ");
    toast.error(`Please fill in the following fields: ${missingFieldNames}`);
    return;
  }

  try {
    const token = localStorage.getItem("Bestie_accesstoken");
    const payload = {
      ...formData,
      mobile_number: `+91${formData.mobile_number}`,
      manager_executive: Number(formData.manager_executive),
    };

    console.log("Request payload:", payload);
    console.log("API endpoint:", `${BASE_URL}/api/register-executive/`);
    console.log("Token:", token ? "Present" : "Missing");

    const response = await fetch(`${BASE_URL}/api/register-executive/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), // Add token if available
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    // Always try to get response body (even for successful responses)
    let responseData;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    console.log("Response data:", responseData);

    if (!response.ok) {
      // More detailed error logging
      console.error("API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        url: response.url
      });

      // Handle different types of error responses
      let errorMessage = "Something went wrong. Please try again.";
      
      if (typeof responseData === 'object' && responseData !== null) {
        // Handle object responses
        errorMessage = responseData.message || 
                     responseData.error || 
                     responseData.detail || 
                     JSON.stringify(responseData);
      } else if (typeof responseData === 'string') {
        // Handle string responses
        errorMessage = responseData;
      }

      toast.error(errorMessage);
      return;
    }

    console.log("Success response:", responseData);
    toast.success("Executive added successfully!");
    setShowExecutiveModal(false);
    
  } catch (error) {
    // Enhanced error logging
    console.error("Network/Fetch Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    });
    
    // Check if it's a network error vs parsing error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      toast.error("Network error: Unable to connect to server. Please check your internet connection.");
    } else if (error.name === 'SyntaxError') {
      toast.error("Server response format error. Please try again or contact support.");
    } else {
      toast.error(`Error: ${error.message}`);
    }
  }
};

  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await getAdmins();
        setAdmins(data);
      } catch (error) {
        console.error("Error fetching admins:", error.message);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <>
      <div
        className="container"
        style={{ background: "white", borderRadius: "10px" }}
      >
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 col-12">
              <div className="my-3">
                <label className="formHeading">Executive Name</label>
                <MDBInput
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  type="text"
                />
              </div>
              <div className="my-3">
                <label className="formHeading">Phone Number</label>
                <div className="d-flex align-items-center">
                  <span className="me-2">+91</span>
                  <MDBInput
                    name="mobile_number"
                    value={formData.mobile_number}
                    required
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      handleInputChange({
                        target: { name: "mobile_number", value },
                      });
                    }}
                    type="text"
                  />
                </div>
              </div>

              <div className="my-3">
                <label className="formHeading">Place</label>
                <MDBInput
                  name="place"
                  required
                  value={formData.place}
                  onChange={handleInputChange}
                  type="text"
                />
              </div>
              <div className="my-3">
                <label className="formHeading">Profession</label>
                <MDBInput
                  name="profession"
                  required
                  value={formData.profession}
                  onChange={handleInputChange}
                  type="text"
                />
              </div>
              <div className="my-3">
                <label className="formHeading">Gender</label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div className="my-3">
                <label className="formHeading">Executive ID</label>
                <MDBInput
                  name="executive_id"
                  value={formData.executive_id}
                  onChange={handleInputChange}
                  type="text"
                />
              </div>
              <div className="my-3">
                <label className="formHeading">Manager</label>
                <select
                  name="manager_executive"
                  value={formData.manager_executive || ""}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Manager</option>
                  {admins.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6 col-12">
              <div className="my-3">
                <label className="formHeading">Email ID</label>
                <MDBInput
                  required
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleInputChange}
                  type="email"
                />
              </div>
              <div className="my-3">
                <label className="formHeading">Age</label>
                <MDBInput
                  required
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  type="number"
                />
              </div>
              <div className="my-3">
                <label className="formHeading">Education</label>
                <MDBInput
                  required
                  name="education_qualification"
                  value={formData.education_qualification}
                  onChange={handleInputChange}
                  type="text"
                />
              </div>
              <div className="my-3">
                <label className="formHeading">Skills</label>
                <MDBInput
                  required
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  type="text"
                />
              </div>
              <div className="my-3">
                <label className="formHeading">Status</label>
                <select
                  required
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="my-3 position-relative">
                <label className="formHeading">Password</label>
                <div className="d-flex align-items-center">
                  <MDBInput
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    type={isPasswordVisible ? "text" : "password"}
                    className="flex-grow-1"
                  />
                  <MDBIcon
                    fas
                    icon={isPasswordVisible ? "eye-slash" : "eye"}
                    onClick={togglePasswordVisibility}
                    className="ms-2 cursor-pointer"
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="buttonContainer my-3">
            <div className="d-grid col-5 mx-auto">
              <button onClick={handleCancel} type="button" className="canexe">
                Cancel
              </button>
            </div>
            <div className="d-grid col-5 mx-auto">
              <button type="submit" className="addexe">
                Add
              </button>
            </div>
          </div>
        </form>
        <ToastContainer />
      </div>
    </>
  );
}

export default AddExecutive;
