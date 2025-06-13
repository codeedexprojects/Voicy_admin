import React, { useEffect, useState } from "react";
import {
  getprofile,
  sendOtpForPasswordReset,
  resetPasswordWithOtp,
  editProfile
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
  Container
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from "@mui/icons-material";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    email: "",
    mobile_number: ""
  });
  
  // Toast states
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const id = localStorage.getItem("ManagerId");

  useEffect(() => {
    fetchProfile();
  }, [id]);

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
      showToast("Profile updated successfully", "success");
    } catch (err) {
      console.error("Failed to update profile", err);
      showToast("Failed to update profile", "error");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({
      name: profile.name || "",
      email: profile.email || "",
      mobile_number: profile.mobile_number || ""
    });
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
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
        {/* Profile Information Card */}
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
                    onClick={() => setIsEditing(true)}
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
            </CardContent>
          </Card>
        </Grid>

        {/* Password Reset Card */}
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