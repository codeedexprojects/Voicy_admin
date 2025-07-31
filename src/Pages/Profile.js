import React, { useEffect, useState } from "react";
import {
  getprofile,
  sendOtpForPasswordReset,
  resetPasswordWithOtp,
  editProfile,
  sendOtpForProfileEdit,
  verifyOtpForProfileEdit
} from "../services/allApi";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Grid,
  Avatar,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  LinearProgress
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Timer as TimerIcon
} from "@mui/icons-material";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editOtpSent, setEditOtpSent] = useState(false);
  const [editOtp, setEditOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [editTimeLeft, setEditTimeLeft] = useState(0);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    email: "",
    mobile_number: ""
  });
  
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const id = localStorage.getItem("ManagerId");

  useEffect(() => {
    fetchProfile();
  }, [id]);

 
  useEffect(() => {
    let interval;
    if (otpVerified && editTimeLeft > 0) {
      interval = setInterval(() => {
        setEditTimeLeft(prev => {
          if (prev <= 1) {
            handleCancelEdit();
            showToast("Edit time expired. Please try again.", "warning");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpVerified, editTimeLeft]);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getprofile(id);
      // console.log(data,"profile");
      
      setProfile(data);
      setEditedProfile({
        name: data.name || "",
        email: data.email || "",
        mobile_number: data.mobile_number || ""
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Password reset functions
  const handleSendOtp = async () => {
    if (!profile?.mobile_number) {
      showToast("Mobile number not found", "error");
      return;
    }
    
    try {
      await sendOtpForPasswordReset(String(profile.mobile_number));
      setOtpSent(true);
      showToast("OTP sent successfully to your mobile", "success");
    } catch (err) {
      console.error("Failed to send OTP", err);
      showToast("Failed to send OTP. Please try again", "error");
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    try {
      await resetPasswordWithOtp({
        mobile_number: String(profile.mobile_number),
        new_password: newPassword,
        otp: otp.trim(),
      });
      showToast("Password reset successful", "success");
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error("Failed to reset password", err);
      showToast("Invalid OTP or reset failed", "error");
    }
  };

  // Profile editing functions
  const handleEditClick = async () => {
    if (!profile?.mobile_number) {
      showToast("Mobile number not found", "error");
      return;
    }

    try {
      await sendOtpForProfileEdit(String(profile.mobile_number));
      setEditOtpSent(true);
      setIsEditing(true);
      showToast("OTP sent to your mobile for profile editing", "success");
    } catch (err) {
      console.error("Failed to send OTP for profile edit", err);
      showToast("Failed to send OTP. Please try again", "error");
    }
  };

  const handleVerifyOtp = async () => {
    if (!editOtp.trim()) {
      showToast("Please enter the OTP", "error");
      return;
    }

    try {
      await verifyOtpForProfileEdit({
        mobile_number: String(profile.mobile_number),
        otp: editOtp.trim()
      });
      
      setOtpVerified(true);
      setEditTimeLeft(300); // 5 minutes = 300 seconds
      showToast("OTP verified! You have 5 minutes to edit your profile.", "success");
    } catch (err) {
      console.error("Failed to verify OTP", err);
      showToast("Invalid OTP. Please try again.", "error");
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile.name.trim() || !editedProfile.email.trim() || !editedProfile.mobile_number.trim()) {
      showToast("All fields are required", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedProfile.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    try {
      const updatedProfile = await editProfile(id, editedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setEditOtpSent(false);
      setEditOtp("");
      setOtpVerified(false);
      setEditTimeLeft(0);
      showToast("Profile updated successfully", "success");
      
      // Update the editedProfile state with new data
      setEditedProfile({
        name: updatedProfile.name || "",
        email: updatedProfile.email || "",
        mobile_number: updatedProfile.mobile_number || ""
      });
    } catch (err) {
      console.error("Failed to update profile", err);
      showToast("Failed to update profile. Please try again.", "error");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditOtpSent(false);
    setEditOtp("");
    setOtpVerified(false);
    setEditTimeLeft(0);
    setEditedProfile({
      name: profile.name || "",
      email: profile.email || "",
      mobile_number: profile.mobile_number || ""
    });
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            Failed to load profile data
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: "primary.main" }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {profile.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {profile.role}
                  </Typography>
                </Box>
                {!isEditing && (
                  <IconButton
                    color="primary"
                    onClick={handleEditClick}
                    sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {!isEditing ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PersonIcon sx={{ mr: 2, color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {profile.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <EmailIcon sx={{ mr: 2, color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {profile.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PhoneIcon sx={{ mr: 2, color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Mobile Number
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {profile.mobile_number}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box>
                  {/* OTP Verification Step */}
                  {editOtpSent && !otpVerified && (
                    <Box mb={3}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <SecurityIcon sx={{ mr: 2, color: "primary.main" }} />
                        <Typography variant="h6" color="primary">
                          Step 1: OTP Verification
                        </Typography>
                      </Box>
                      <TextField
                        label="Enter OTP"
                        fullWidth
                        value={editOtp}
                        onChange={(e) => setEditOtp(e.target.value)}
                        variant="outlined"
                        inputProps={{ maxLength: 6 }}
                        helperText="Please enter the 6-digit OTP sent to your mobile number"
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleVerifyOtp}
                        disabled={!editOtp.trim()}
                        sx={{ mr: 2, borderRadius: 2 }}
                      >
                        Verify OTP
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}

                  {/* Profile Editing Step */}
                  {otpVerified && (
                    <Box>
                      <Box display="flex" alignItems="center" justify="space-between" mb={2}>
                        <Box display="flex" alignItems="center">
                          <EditIcon sx={{ mr: 2, color: "success.main" }} />
                          <Typography variant="h6" color="success.main">
                            Step 2: Edit Profile
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <TimerIcon sx={{ mr: 1, color: "warning.main" }} />
                          <Typography variant="body2" color="warning.main" fontWeight="bold">
                            Time left: {formatTime(editTimeLeft)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={(editTimeLeft / 300) * 100} 
                        sx={{ mb: 3, height: 6, borderRadius: 3 }}
                        color={editTimeLeft < 60 ? "error" : editTimeLeft < 120 ? "warning" : "success"}
                      />

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Full Name"
                            fullWidth
                            value={editedProfile.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            value={editedProfile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Mobile Number"
                            fullWidth
                            value={editedProfile.mobile_number}
                            onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      
                      <Box display="flex" gap={2} mt={3}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveProfile}
                          sx={{ borderRadius: 2 }}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelEdit}
                          sx={{ borderRadius: 2 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {editOtpSent && !otpVerified && (
                    <Typography variant="body2" color="text.secondary" mt={2}>
                      Enter the OTP to proceed with editing your profile.
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <LockIcon sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                  Password Reset
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={3}>
                Reset your password securely using OTP verification
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSendOtp}
                disabled={isEditing || otpSent}
                sx={{ mb: 2, borderRadius: 2, py: 1.5 }}
              >
                {otpSent ? "OTP Sent" : "Send OTP"}
              </Button>

              {otpSent && (
                <Box>
                  <TextField
                    label="Enter OTP"
                    fullWidth
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    inputProps={{ maxLength: 6 }}
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    helperText="Minimum 6 characters"
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={handleResetPassword}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Reset Password
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={hideToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;