import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import "./Roles.css";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Dropdown from 'react-bootstrap/Dropdown';
import { DoNotDisturb } from '@mui/icons-material';
import { FaPlus } from 'react-icons/fa';
import { AddRole } from '../services/allApi';

function Roles() {
    const [data, setData] = useState([   
        {
            username: 'John Doe',
            role: 'Manager',
            permissions: {
                AddEmployee: true,
                RemoveEmployee: false,
                ReportUser: true,
                GeneratePackage: false,
                GivePayment: true,
                HearCalls: false
            },
            id: '12345',
            password: 'password123'
        },
        {
            username: 'Jane Smith',
            role: 'Admin',
            permissions: {
                AddEmployee: true,
                RemoveEmployee: true,
                ReportUser: true,
                GeneratePackage: true,
                GivePayment: false,
                HearCalls: true
            },
            id: '67890',
            password: 'adminpass'
        },
        {
            username: 'Jane Smith',
            role: 'Admin',
            permissions: {
                AddEmployee: true,
                RemoveEmployee: true,
                ReportUser: true,
                GeneratePackage: true,
                GivePayment: false,
                HearCalls: true
            },
            id: '67890',
            password: 'adminpass'
        }, {
            username: 'Jane Smith',
            role: 'Admin',
            permissions: {
                AddEmployee: true,
                RemoveEmployee: true,
                ReportUser: true,
                GeneratePackage: true,
                GivePayment: false,
                HearCalls: true
            },
            id: '67890',
            password: 'adminpass'
        }
    ]);
        const [show, setShow] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);  
    const [currentEditIndex, setCurrentEditIndex] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        permissions: {
            AddEmployee: false,
            RemoveEmployee: false,
            ReportUser: false,
            GeneratePackage: false,
            GivePayment: false,
            HearCalls: false
        },
        id: "",
        password: ""
    });

    const handleSave = async () => {
        if (formData.name && formData.role && formData.id && formData.password) {
            if (isEditMode) {
                // Editing an existing role
                const updatedData = [...data];
                updatedData[currentEditIndex] = formData;
                setData(updatedData);
            } else {
                // Adding a new role via API
                try {
                    const response = await AddRole(formData); // Call AddRole API
                    // console.log('Role added successfully:', response);

                    // Add the new role to the state
                    setData((prevData) => [...prevData, formData]);
                    setShow(false); // Close the modal
                    setFormData({
                        name: "",
                        role: "",
                        email:"",
                        permissions: {
                            AddEmployee: false,
                            RemoveEmployee: false,
                            ReportUser: false,
                            GeneratePackage: false,
                            GivePayment: false,
                            HearCalls: false
                        },
                        id: "",
                        password: ""
                    });
                } catch (error) {
                    console.error('Error adding role:', error);
                    alert('Failed to add the role.');
                }
            }
        } else {
            alert("Please fill out all fields before saving.");
        }
    };

    const handleClose = () => {
        setShow(false);
        setIsEditMode(false);
        setCurrentEditIndex(null);
        setFormData({
            name: "",
            role: "",
            email:"",
            permissions: {
                AddEmployee: false,
                RemoveEmployee: false,
                ReportUser: false,
                GeneratePackage: false,
                GivePayment: false,
                HearCalls: false
            },
            id: "",
            password: ""
        });
    };

    const handleShow = () => {
        setShow(true);
        if (!isEditMode) {
            setFormData({
                name: "",
                role: "",
                email:"",
                permissions: {
                    AddEmployee: false,
                    RemoveEmployee: false,
                    ReportUser: false,
                    GeneratePackage: false,
                    GivePayment: false,
                    HearCalls: false
                },
                id: "",
                password: ""
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            permissions: {
                ...prevFormData.permissions,
                [name]: checked
            }
        }));
    };

    const handleEditItem = (index) => {
        setIsEditMode(true);  // Set the mode to edit
        setCurrentEditIndex(index);  // Track the index of the user being edited
        const selectedUser = data[index];
        // console.log(selectedUser);


        setFormData({
            name: selectedUser.username,
            role: selectedUser.role,
            permissions: selectedUser.permissions || {
                AddEmployee: false,
                RemoveEmployee: false,
                ReportUser: false,
                GeneratePackage: false,
                GivePayment: false,
                HearCalls: false
            },
            id: selectedUser.id,
            password: selectedUser.password
        });
        setShow(true);  // Open the modal
    };

    // const handleEditItem = ((username) => {
    //     console.log(username);
    //     alert(`Edit Button clicked: ${username}`);
    // })

    const handleRemovedItem = (username) => {
        console.log(username);
        alert(`Remove Button clicked: ${username}`);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSave(); // Call the save function on form submit
    };

    return (
        <>
            {console.log(data)}
            <div className='head-content'>
            <p className="mb-4 d-flex justify-content-between align-items-center emlist">
            Roles And Permission
          
      </p>   
      <button
                className="d-flex align-items-center addnew"
                onClick={handleShow} 
            >
                <FaPlus className="me-2" />Add New Role
            </button>             
            </div>
            <div className='content-holder'>
                {
                    data.map((exec, index) => (
                        <div className='card-container' key={index}>
                            <div className='card-head'>
                                <h5>{exec.username || 'N/A'}</h5>
                                {/* {console.log(exec)} */}
                                <div className="dropdown">
                                    <Dropdown className="d-inline mx-2">
                                        <Dropdown.Toggle style={{boxShadow:'none'}} variant='default' id="dropdown-autoclose-true" bsPrefix="custom-dropdown-toggle">
                                            <MoreVertIcon className='edit-remove-item' />
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className='drop-down-items'>
                                            <Dropdown.Item href="#" variant='default' onClick={() => handleEditItem(index)}><EditNoteIcon />Edit</Dropdown.Item>
                                            <Dropdown.Item href="#" variant='default' onClick={() => handleRemovedItem(exec.username)}><DoNotDisturb />Remove</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <span className='mt-2'>{exec.role || 'N/A'}</span>
                            <div className='id-password-holder mt-3'>
                                <span>ID <br /><strong>{exec.id || 'N/A'}<br /></strong></span>
                                <span>Password <br /><strong>{exec.password || 'N/A'}<br /></strong></span>
                            </div>
                        </div>
                    ))
                }
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Roles</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group className="mb-3" controlId="Manufacturer-Name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name" // Add name attribute
                                value={formData.username} // Bind value from state
                                onChange={handleInputChange}
                                placeholder="Manufacturer Name"
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="Manufacturer-Name">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="text"
                                name="email" // Add name attribute
                                value={formData.email} // Bind value from state
                                onChange={handleInputChange}
                                placeholder="Email"
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="Manager">
                            <Form.Label>Role</Form.Label>
                            <Form.Select aria-label="Select role"
                                name="role" // Add name attribute
                                value={formData.role} // Bind value from state
                                onChange={handleInputChange}>
                                <option value="">{formData.role || 'Select Option'}</option>
                                <option value="hr_user">Hr User</option>
                                <option value="hr_executive">Hr Executive</option>
                                <option value="manage_user">Manage User</option>
                                <option value="manager_executive">Manage Executive</option>
                                <option value="superuser">Super User</option>

                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Functions</Form.Label>
                            <div className="checkbox-group">
                                {Object.keys(formData.permissions || {}).map(permission => (
                                    <Form.Check
                                        key={permission}
                                        type="checkbox"
                                        label={permission}
                                        name={permission}
                                        checked={formData.permissions[permission]}
                                        onChange={handleCheckboxChange}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="ID">
                            <Form.Label>ID</Form.Label>
                            <Form.Control
                                type="text"
                                name="id" // Add name attribute
                                value={formData.id} // Bind value from state
                                onChange={handleInputChange}
                                placeholder="54321"
                                onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault(); // Prevent any non-numeric character
                                    }
                                }}
                                onKeyDown={(e) => {
                                    // Prevent arrow keys from working
                                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="Password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="text" // Use password type for security
                                name="password" // Add name attribute
                                value={formData.password} // Bind value from state
                                onChange={handleInputChange}
                                placeholder=""
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    )
}

export default Roles;