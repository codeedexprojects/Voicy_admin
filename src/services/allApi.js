import axios from "axios";
import { BASE_URL } from "./baseUrl";
import { commonApi } from "./commonApi";


export const getAllExecutives = async () => {
  try {
    const method = "GET";
    const url = `${BASE_URL}/api/all-executives/`;
    
    // Make the request using commonApi without request body or custom headers
    const response = await commonApi(method, url);

    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data; 
    } else {
      throw new Error("Failed to fetch executives data");
    }
  } catch (error) {
    console.error("Error fetching executives data:", error.message);
    console.log(error.data);
    
    throw error; 
  }
};
export const getUnderManagerExecutives = async (id) => {
  try {
    const method = "GET";
    const url = `${BASE_URL}/api/executives/under-manager/${id}/`;

    const response = await commonApi(method, url);

    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch under-manager executives data");
    }
  } catch (error) {
    console.error("Error fetching under-manager executives data:", error.message);
    console.log(error.data);
    
    throw error;
  }
};
export const getFullReport = async () => {
  try {
    const method = "GET";
    const url = `${BASE_URL}/api/full_report/`;

    const response = await commonApi(method, url);

    if (response.status === 200 && response.data) {
      return response.data;
    } else {
        throw new Error("Failed to fetch full report data");
    }
  } catch (error) {
    console.error("Error fetching full report data:", error.message);
    console.log(error.data);
    
    throw error;
  }
};

export const AddManager = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/create-admin/`, formData);
    
    if (response.status === 200 || response.status === 201) {
      return response.data; 
    } else {
      throw new Error("Failed to add the manager");
    }
  } catch (error) {
    console.error("Error adding image:", error.response ? error.response.data : error.message);
    throw error; 
  }
};


export const getManagers = async () => {
  try {
    const method = "GET";
    const url = `${BASE_URL}/api/admins/`;

    const response = await commonApi(method, url);

    if (response.status === 200 && response.data) {
      return response.data;
    } else {
        throw new Error("Failed to fetch manager list");
    }
  } catch (error) {
    console.error("Error fetching full manager data:", error.message);
    console.log(error.data);
    
    throw error;
  }
};
export const deleteManager = async (managerId) => {
  try {
    const method = "DELETE";
    const url = `${BASE_URL}/api/admins/${managerId}/`;

    const response = await commonApi(method, url);

    if (response.status === 204) {
      return { success: true, message: "Manager deleted successfully" };
    } else {
      throw new Error("Failed to delete manager");
    }
  } catch (error) {
    console.error("Error deleting manager:", error.message);
    console.log(error.data);
    
    throw error;
  }
};

export const getAllUsers = async () => {
    try {

      const response = await axios.get(`${BASE_URL}/api/user-statistics/`);
      
      if (response.status === 200 && response.data) {
        return response.data; 
      } else {
        throw new Error("Failed to fetch Users data");
      }
    } catch (error) {
      console.error("Error fetching Users data:", error.message);
      throw error; 
    }
  };
  export const getCarousel = async () => {
    try {

      const response = await axios.get(`${BASE_URL}/api/carousel-images/`);
      
      if (response.status === 200 && response.data) {
        return response.data; 
      } else {
        throw new Error("Failed to fetch Carousel data");
      }
    } catch (error) {
      console.error("Error fetching Carousel data:", error.message);
      throw error; 
    }
  };
  export const getAdmins = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/admins/`);
  
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        throw new Error("Failed to fetch Admin data");
      }
    } catch (error) {
      console.error("Error fetching Admin data:", error.message);
      throw error;
    }
  };
  
 // Function to delete a single user by ID
 export const deleteCarousel = async (imageId) => {
  try {
    // Use axios to send the DELETE request
    const response = await axios.delete(`${BASE_URL}/api/carousel-images/${imageId}/`);
    
    // Check if the response is successful
    if (response.status === 204) {
      return { message: "image deleted successfully" };
    } else {
      throw new Error("Failed to delete the image");
    }
  } catch (error) {
    console.error("Error deleting user:", error.message);
    throw error; 
  }
};
  
export const editCarousel = async (imageId, updatedData) => {
  try {
    // Use axios to send a PUT request to update the executive's data
    const response = await axios.put(`${BASE_URL}/api/carousel-images/${imageId}/`, updatedData);

    // Check if the response is successful and return the updated data
    if (response.status === 200 && response.data) {
      return response.data; // Return the updated executive data
    } else {
      throw new Error("Failed to update carousel data");
    }
  } catch (error) {
    console.error("Error updating carousel data:", error.message);
    throw error; // Re-throw the error to handle it in the component
  }
};
export const addCarousel = async (formData) => {
  try {
    // Make the API call with formData
    const response = await axios.post(`${BASE_URL}/api/carousel-images/`, formData);
    
    // Check if the response is successful
    if (response.status === 200 || response.status === 201) {
      return response.data; 
    } else {
      throw new Error("Failed to add the image");
    }
  } catch (error) {
    console.error("Error adding image:", error.response ? error.response.data : error.message);
    throw error; 
  }
};
export const getCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/recharge-plan-categories/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Add a new category
export const addCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/recharge-plan-categories/`, categoryData);
    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else {
      throw new Error("Failed to add the category");
    }
  } catch (error) {
    console.error("Error adding category:", error.response ? error.response.data : error.message);
    throw error;
  }
};
export const getSingleExecutive = async (executive_id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/single-executives/${executive_id}/`);
    
    // Check if the response is successful and contains data
    if (response.status === 200 && response.data) {
      console.log("executive Data Response:", response.data); // Log the actual data
      return response.data; // Return only the data part of the response
    } else {
      throw new Error("Failed to fetch user data");
    }
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    throw error;
  }
};

  export const getexecutiverating = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/executives/${userId}/ratings/`);
      
      // Check if the response is successful and data exists
      if (response.status === 200 && response.data) {
        console.log(response.data);
        
        return response.data; // Return the fetched user data
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      console.log(error.data);
      
      throw error;
    }
  };
export const getSingleUser = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}/`);
      
      // Check if the response is successful and data exists
      if (response.status === 200 && response.data) {
        console.log("User Data Response:", response.data); // Log the actual data

        return response.data; // Return the fetched user data
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      console.log(error.data);
      
      throw error; // Re-throw the error to handle it in the component
    }
  };
  export const getSingleUserstatistics = async (userId) => {
    try {
      // Use axios to make the request
      const response = await axios.get(`${BASE_URL}/api/user-statistics/${userId}/`);
      
      // Check if the response is successful and data exists
      if (response.status === 200 && response.data) {
        console.log("singleuser",response);

        return response.data; // Return the fetched user data
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      console.log(error.data);
      
      throw error; 
    }
  };
  export const getSingleExecutivestatistics = async (executiveId) => {
    try {
      // Use axios to make the request
      const response = await axios.get(`${BASE_URL}/api/executive-statistics/${executiveId}/`);
      
      // Check if the response is successful and data exists
      if (response.status === 200 && response.data) {
        console.log("singleexe",response);
        
        return response.data; // Return the fetched user data
      } else {
        throw new Error("Failed to fetch executive data");
      }
    } catch (error) {
      console.error("Error fetching executive data:", error.message);
      console.log(error.data);
      
      throw error; 
    }
  };
  export const getSingleExecutivestatisticsPeriod = async (executiveId, period) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/executive-report/${executiveId}/?period=${period}`);
  
      if (response.status === 200 && response.data) {
        console.log("singleexe", response);
        return response.data;
      } else {
        throw new Error("Failed to fetch executive data");
      }
    } catch (error) {
      console.error("Error fetching executive data:", error.message);
      console.log(error.response?.data);
      throw error;
    }
  };
  
  // Function to delete a single user by ID
export const deleteSingleUser = async (userId) => {
    try {
      // Use axios to send the DELETE request
      const response = await axios.delete(`${BASE_URL}/api/users/${userId}/`);
      
      // Check if the response is successful
      if (response.status === 204) {
        return { message: "User deleted successfully" };
      } else {
        throw new Error("Failed to delete the user");
      }
    } catch (error) {
      console.error("Error deleting user:", error.message);
      throw error; // Re-throw the error to handle it in the component
    }
  };

  
  // Function to delete a single executive by ID
export const deleteSingleExecutive = async (executiveId) => {
    try {
      // Use axios to send the DELETE request
      const response = await axios.delete(`${BASE_URL}/api/single-executives/${executiveId}/`);
      
      // Check if the response is successful
      if (response.status === 204) {
        return { message: "Executive deleted successfully" };
      } else {
        throw new Error("Failed to delete the executive");
      }
    } catch (error) {
      console.error("Error deleting executive:", error.message);
      throw error; // Re-throw the error to handle it in the component
    }
  };
  

  // getExecutiveRating
export const getExecutiveRating = async (executiveId) => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/ratings/${executiveId}/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data; 
    } else {
      throw new Error("Failed to fetch executive rating data");
    }
  } catch (error) {
    console.error("Error fetching executive rating data:", error.message);
    console.log(error.response?.data || error.message); // log error response if available
    
    throw error; // Re-throw the error to handle it in the component
  }
};



// Function to get call history by executive ID
export const getexecutiveCallHistory = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/exe-call-history/${id}/`); 
    
    // Check if the response is successful
    if (response.status === 200 && response.data) {
      console.log("executivecall",response.data);
      
      return response.data; // Return the call history data

    } else {
      throw new Error("Failed to fetch call history data");
      
    }
  } catch (error) {
    console.error("Error fetching call history data:", error.message);
    console.log(error.data);
    
    throw error; // Re-throw the error to handle it in the component
  }
};


// Function to get call history by user ID
export const getuserCallHistory = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/call-history/${id}/`);
    
    // If the response is successful and contains data, return it
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("No call history found for this user.");
      return []; // Return an empty array if no data exists
    }

    console.error("Error fetching call history data:", error.message);
    throw error; // Re-throw for other errors
  }
};



// function to edit single executive
export const editSingleExecutive = async (userId, updatedData) => {
  try {
    // Use axios to send a PUT request to update the executive's data
    const response = await axios.patch(`${BASE_URL}/api/single-executives/${userId}/`, updatedData);

    // Check if the response is successful and return the updated data
    if (response.status === 200 && response.data) {
      return response.data; // Return the updated executive data
    } else {
      throw new Error("Failed to update user data");
    }
  } catch (error) {
    console.error("Error updating user data:", error.message);
    throw error; // Re-throw the error to handle it in the component
  }
};



// Function for admin login
export const adminLogin = async (credentials) => {
  try {
    // Send a POST request to the admin login API
    const response = await axios.post(`${BASE_URL}/api/admin-login/`, credentials);

    // Check if the response is successful and return the token or admin data
    if (response.status === 200 && response.data) {
      return response.data; // Return the admin login response (e.g., token, user data)
    } else {
      throw new Error("Failed to log in as admin");
    }
  }catch (error) {
    console.error("Error during admin login:", error.response ? error.response.data : error.message);
    throw error; // Re-throw the error to handle it in the component
  }
  
};



export const getStatistics = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/statistics/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data; 
    } else {
      throw new Error("Failed to fetch executives data");
    }
  } catch (error) {
    console.error("Error fetching executives data:", error.message);
    console.log(error.data);
    
    throw error; // Re-throw the error to handle it in the component
  }
};


export const banExecutive = async (executiveId) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.post(`${BASE_URL}/api/ban-executive/${executiveId}/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to ban the executive");
    }
  } catch (error) {
    console.error("Error banning the executive:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};
export const suspendExecutive = async (executiveId) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.post(`${BASE_URL}/api/executive-suspend/${executiveId}/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to ban the executive");
    }
  } catch (error) {
    console.error("Error banning the executive:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};
export const onlineExecutive = async (executiveId) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.patch(`${BASE_URL}/api/executives/${executiveId}/set_online/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to online the executive");
    }
  } catch (error) {
    console.error("Error onining the executive:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};
export const offlineExecutive = async (executiveId) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.patch(`${BASE_URL}/api/executives/${executiveId}/set_offline/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to online the executive");
    }
  } catch (error) {
    console.error("Error banning the executive:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

export const unbanExecutive = async (executiveId) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.post(`${BASE_URL}/api/executive-unban/${executiveId}/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to ban the executive");
    }
  } catch (error) {
    console.error("Error banning the executive:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};
export const unsuspendExecutive = async (executiveId) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.post(`${BASE_URL}/api/executive-unsuspend/${executiveId}/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to ban the executive");
    }
  } catch (error) {
    console.error("Error banning the executive:", error.message);
    throw error; 
  }
};



export const AddPackage = async (formData) => {
  try {
    // Make the API call with formData
    const response = await axios.post(`${BASE_URL}/api/recharge-plan-create/`, formData);
    
    // Check if the response is successful
    if (response.status === 200 || response.status === 201) {
      return response.data; 
    } else {
      throw new Error("Failed to add the package");
    }
  } catch (error) {
    console.error("Error adding package:", error.response ? error.response.data : error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};




export const getPackage = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/recharge-plans/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data; 
    } else {
      throw new Error("Failed to fetch package data");
    }
  } catch (error) {
    console.error("Error fetching package data:", error.message);
    console.log(error.data);
    
    throw error; 
  }
};


export const EditPackage = async (packageId, formData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/api/recharge-plans/${packageId}/`, formData);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to update the package");
    }
  } catch (error) {
    console.error("Error updating package:", error.message);
    throw error;
  }
};

export const DeletePackage = async (packageId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/recharge-plans/${packageId}/`);

    if (response.status === 204) {
      return "Package deleted successfully";
    } else {
      throw new Error("Failed to delete the package");
    }
  } catch (error) {
    console.error("Error deleting package:", error.message);
    throw error;
  }
};


export const getredeemRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/redeem-requests/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data; 
    } else {
      throw new Error("Failed to fetch Requests");
    }
  } catch (error) {
    console.error("Error fetching Requests:", error.message);
    throw error; 
  }
};


export const AddRole = async (formData) => {
  try {
    // Make the API call with formData
    const response = await axios.post(`${BASE_URL}/api/create-admin/`, formData);
    
    // Check if the response is successful
    if (response.status === 200 || response.status === 201) {
      return response.data; 
    } else {
      throw new Error("Failed to add the role");
    }
  } catch (error) {
    console.error("Error adding role:", error.response ? error.response.data : error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};



export const getRequests = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/careers/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch Requests data");
    }
  } catch (error) {
    console.error("Error fetching Requests data:", error.message);
    throw error; 
  }
};



// Get call statistics

export const getCallstatistics = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/call-statistics/weekly/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch callstatistics data");
    }
  } catch (error) {
    console.error("Error fetching callstatistics data:", error.message);
    throw error; 
  }
};

export const getCallstatisticsmonthly = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/call-statistics/monthly/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch callstatistics data");
    }
  } catch (error) {
    console.error("Error fetching callstatistics data:", error.message);
    throw error; 
  }
};


export const getRevenue = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/up-del-revenue-target/1/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch Revenue data");
    }
  } catch (error) {
    console.error("Error fetching Revenue data:", error.message);
    throw error; 
  }
};

export const editRevenue = async (updatedRevenue) => {
  try {
    // Send updatedRevenue as the request body
    const response = await axios.patch(`${BASE_URL}/api/up-del-revenue-target/1/`, updatedRevenue);

    // Check if the response is successful
    if (response.status === 200) {
      // Return the response data (assuming it doesn't have a "data" field)
      return response;
    } else {
      throw new Error("Failed to edit Revenue data");
    }
  } catch (error) {
    console.error("Error editing Revenue data:", error.message);
    throw error;
  }
};





export const banUser = async (userID) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.post(`${BASE_URL}/api/ban-user//${userID}/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to ban the user");
    }
  } catch (error) {
    console.error("Error banning the user:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};
export const suspendUser = async (userID) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.post(`${BASE_URL}/api/user-suspend/${userID}/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to ban the user");
    }
  } catch (error) {
    console.error("Error banning the user:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

export const unbanUser = async (userID) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.post(`${BASE_URL}/api/user-unban/${userID}/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to unban the user");
    }
  } catch (error) {
    console.error("Error banning the executive:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};


export const unsuspendUser = async (userID) => {
  try {
    // Make the API call to ban the executive
    const response = await axios.post(`${BASE_URL}/api/user-unsuspend/${userID}/`);
    
    // Check if the response is successful
    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error("Failed to ban the executive");
    }
  } catch (error) {
    console.error("Error banning the executive:", error.message);
    throw error; 
  }
};


export const getExecutiveStatistics = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/executive-stats/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch executivestatistics data");
    }
  } catch (error) {
    console.error("Error fetching executivestatistics data:", error.message);
    throw error; 
  }
};



export const getRunningcalls = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/ongoing-calls/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch ongoingcall data");
    }
  } catch (error) {
    console.error("Error fetching ongoingcall data:", error.message);
    throw error; 
  }
};



export const getusercoinspend = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/total-coins-spend/${id}/`); 
    
    // Check if the response is successful
    if (response.status === 200 && response.data) {
      console.log("usercoinspend",response.data);
      
      return response.data; // Return the call history data

    } else {
      throw new Error("Failed to fetch user coin data");
      
    }
  } catch (error) {
    console.error("Error fetching user coin data:", error.message);
    console.log(error.data);
    
    throw error; // Re-throw the error to handle it in the component
  }
};


export const getExecutivecallRating = async (executiveId) => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/executives/${executiveId}/ratings/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      console.log("executivecall",response.data);

      return response.data; 
      
    } else {
      throw new Error("Failed to fetch executive rating data");
    }
  } catch (error) {
    console.error("Error fetching executive rating data:", error.message);
    console.log(error.response?.data || error.message); // log error response if available
    
    throw error; // Re-throw the error to handle it in the component
  }
};

export const getUsercallRating = async (UserId) => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/user/${UserId}/executive-ratings/`);
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      console.log("usercallrating",response.data);

      return response.data; 
      
    } else {
      throw new Error("Failed to fetch user rating data");
    }
  } catch (error) {
    console.error("Error fetching user rating data:", error.message);
    console.log(error.response?.data || error.message); // log error response if available
    
    throw error; // Re-throw the error to handle it in the component
  }
};




// Add user coin

export const Addcoinuser = async (userId, planId) => {
  try {
    // Make the API call to add coin to the user
    const response = await axios.post(
      `${BASE_URL}/api/recharge-admin/${userId}/plan/${planId}/`
    );

    // Check if the response is successful
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to add coin to user");
    }
  } catch (error) {
    console.error("Error adding coin to the user:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};


// get user coin balance
export const getusercoinbalance = async (userId) => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/mycoins/${userId}/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      console.log("usercoinbalance",response.data);

      return response.data; 
      
    } else {
      throw new Error("Failed to fetch user coin balance data");
    }
  } catch (error) {
    console.error("Error fetching user coin balance data:", error.message);
    console.log(error.response?.data || error.message);
    
    throw error; 
  }
};





// Report
export const getTotalRating = async () => {
  try {
    // Use commonApi or axios to make the request
    const response = await axios.get(`${BASE_URL}/api/user-Total-ratings/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch Total rating data");
    }
  } catch (error) {
    console.error("Error fetching Total rating data:", error.message);
    throw error; 
  }
};


export const getexecutivetalktime = async (executiveId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/executives/stats/${executiveId}/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      console.log(response.data);
      
      return response.data; 
    } else {
      throw new Error("Failed to fetch executive data");
    }
  } catch (error) {
    console.error("Error fetching executive data:", error.message);
    console.log(error.data);
    
    throw error;
  }
};


export const blockedUsers = async (executiveId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/blocked-users/${executiveId}/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      console.log(response.data);
      
      return response.data;
    } else {
      throw new Error("Failed to fetch blocked users data");
    }
  } catch (error) {
    console.error("Error fetching blocked users data:", error.message);
    console.log(error.data);
    
    throw error;
  }
};


export const profileRequest = async (executiveId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/executive/${executiveId}/single-profile-picture/`);
    
    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      console.log(response.data);
      
      return response.data;
    } else {
      throw new Error("Failed to fetch profile request data");
    }
  } catch (error) {
    console.error("Error fetching profile request data:", error.message);
    console.log(error.data);
    
    throw error;
  }
};






export const approveandrejectprofile = async (executiveID, formData) => {
  try {
    // Make the API call with form-data
    const response = await axios.patch(
      `${BASE_URL}/api/executive/${executiveID}/approve-reject/`,
      formData, // Pass the form-data payload
      {
        headers: {
          'Content-Type': 'multipart/form-data', // Explicitly set the content type
        },
      }
    );

    // Check if the response is successful
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to update the profile');
    }
  } catch (error) {
    console.error('Error updating the profile:', error.message);
    throw error;
  }
};



export const createCoinConversion = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/coin-conversions/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error('Failed to create coin conversion');
    }
  } catch (error) {
    console.error('Error creating coin conversion:', error.message);
    throw error;
  }
};

export const getCoinConversions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/coin-conversions/`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to fetch coin conversions');
    }
  } catch (error) {
    console.error('Error fetching coin conversions:', error.message);
    throw error;
  }
};



export const getRedeemRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/redeem-requests/`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to fetch redeem requests');
    }
  } catch (error) {
    console.error('Error fetching redeem requests:', error.message);
    throw error;
  }
};



export const getAccounts = async () => {
  try {
    const method = "GET";
    const url = `${BASE_URL}/api/user/purchase-history/`;
    // Make the request using commonApi without request body or custom headers
    const response = await commonApi(method, url);

    // Check if the response is successful and data exists
    if (response.status === 200 && response.data) {
      return response.data; 
    } else {
      throw new Error("Failed to fetch accounts data");
    }
  } catch (error) {
    console.error("Error fetching accounts data:", error.message);
    console.log(error.data);
    
    throw error; 
  }
};





export const getprofile = async (profile_id) => {
  try {
    const method = "GET";
    const url = `${BASE_URL}/api/admin/update/${profile_id}/`;
    const response = await commonApi(method, url);

    if (response.status === 200 && response.data) {
      return response.data; 
    } else {
      throw new Error("Failed to fetch profile data");
    }
  } catch (error) {
    console.error("Error fetching profile data:", error.message);
    console.log(error.data);
    
    throw error; 
  }
};






export const editProfile = async (profile_id, profileData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/api/admin/update/${profile_id}/`, {
      name: profileData.name,
      email: profileData.email,
      mobile_number: profileData.mobile_number,
    });
     
    if (response.status === 200) {
      return response.data; // Return response.data instead of response
    } else {
      throw new Error("Failed to edit profile data");
    }
  } catch (error) {
    console.error("Error editing profile data:", error.message);
    throw error;
  }
};



export const sendOtpForPasswordReset = async (mobile_number) => {
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('mobile_number', mobile_number);

    const response = await axios.post(`${BASE_URL}/api/password-reset/send-otp/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to send OTP");
    }
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw error;
  }
};

export const resetPasswordWithOtp = async ({ mobile_number, new_password, otp }) => {
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('mobile_number', mobile_number);
    formData.append('new_password', new_password);
    formData.append('otp', otp);

    const response = await axios.post(`${BASE_URL}/api/password-reset/verify-otp/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to reset password");
    }
  } catch (error) {
    console.error("Error resetting password:", error.message);
    throw error;
  }
};

// Alternative approach using URLSearchParams for application/x-www-form-urlencoded
export const sendOtpForPasswordResetAlt = async (mobile_number) => {
  try {
    const params = new URLSearchParams();
    params.append('mobile_number', mobile_number);

    const response = await axios.post(`${BASE_URL}/api/password-reset/send-otp/`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to send OTP");
    }
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw error;
  }
};

export const resetPasswordWithOtpAlt = async ({ mobile_number, new_password, otp }) => {
  try {
    const params = new URLSearchParams();
    params.append('mobile_number', mobile_number);
    params.append('new_password', new_password);
    params.append('otp', otp);

    const response = await axios.post(`${BASE_URL}/api/password-reset/verify-otp/`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to reset password");
    }
  } catch (error) {
    console.error("Error resetting password:", error.message);
    throw error;
  }
};
