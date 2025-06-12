import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Image } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { BsPencilSquare, BsTrash, BsPlusCircle } from 'react-icons/bs';
import { getCarousel, addCarousel, editCarousel, deleteCarousel } from '../services/allApi';

function Carousel() {
    const [images, setImages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentImage, setCurrentImage] = useState({ id: null, title: '', file: null, preview: '' });

    useEffect(() => {
        fetchCarouselImages();
    }, []);

    const fetchCarouselImages = async () => {
        try {
            const response = await getCarousel();
            console.log('Fetched carousel images:', response); // Verify structure
            setImages(response); // Make sure response.data is an array
        } catch (error) {
            console.error('Error fetching carousel images:', error);
            toast.error('Failed to load carousel images');
        }
    };
    

    const handleShowModal = (mode, image = { id: null, title: '', file: null, preview: '' }) => {
        setModalMode(mode);
        setCurrentImage({
            ...image,
            preview: image.full_image_url || '' // Show existing image in preview for edit mode
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentImage({ id: null, title: '', file: null, preview: '' });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCurrentImage({
                ...currentImage,
                file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleAddOrEditImage = async () => {
        try {
            const formData = new FormData();
            formData.append('title', currentImage.title);
            if (currentImage.file) {
                formData.append('image', currentImage.file);
            }

            if (modalMode === 'add') {
                await addCarousel(formData);
                toast.success('Image added successfully');
            } else {
                await editCarousel(currentImage.id, formData);
                toast.success('Image updated successfully');
            }

            await fetchCarouselImages(); // Refresh images after add/edit
            handleCloseModal();
        } catch (error) {
            console.error(`Failed to ${modalMode} image:`, error);
            toast.error(`Failed to ${modalMode === 'add' ? 'add' : 'update'} image`);
        }
    };

    const handleDeleteImage = async (id) => {
        try {
            await deleteCarousel(id);
            setImages(images.filter(img => img.id !== id));
            toast.success('Image deleted successfully');
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        }
    };

    return (
        <div className="container mt-4">
           <div style={{background:'white',margin:'10px'}}>
                <Row className="mb-4" style={{ margin: '0px' }}>
                    <Col>
                        <Card className="custom-card shadow-sm p-3 rounded">
                            <Card.Body style={{ padding: '0px' }} className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <BsPlusCircle size={40} color="#5065F6" />
                                    <div className="ms-3">
                                        <h5>Add New Carousel Image</h5>
                                        <p>Click to add a new image to the carousel</p>
                                    </div>
                                </div>
                                <div
                                    className="add-image-container d-flex align-items-center"
                                    onClick={() => handleShowModal('add')}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        backgroundColor: '#f1f1f1',
                                        transition: 'background-color 0.3s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e2e2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
                                >
                                    <span style={{ fontWeight: 'bold' }}>Add Image</span>
                                </div>
                            </Card.Body>
                        </Card>
                        
                    </Col>
                    
                </Row>
    
                <Row style={{ margin: '0px' }}>
                   <>
                        {images && images.length > 0 ? (
                            images.map((image) => (
                                <Col md={4} className="mb-4" key={image.id}>
                                    <Card  className="custom-card shadow-lg p-3 rounded">
                                        <Card.Body style={{ padding: '0px' }} className="d-flex align-items-center justify-content-between">
                                            <Image src={image.full_image_url} alt="Carousel" thumbnail width="100" />
                                            <div className="d-flex flex-column align-items-start">
                                                <h5>{image.title}</h5> {/* Display the image title */}
                                                <div className="d-flex mt-2">
                                                    <Button variant="warning" onClick={() => handleShowModal('edit', image)} className="me-2">
                                                        <BsPencilSquare /> Edit
                                                    </Button>
                                                    <Button variant="danger" onClick={() => handleDeleteImage(image.id)}>
                                                        <BsTrash /> Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <p>No carousel images to display.</p>
                        )}
                   </>
                </Row>
           </div>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'add' ? 'Add Image' : 'Edit Image'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={currentImage.title}
                            onChange={(e) => setCurrentImage({ ...currentImage, title: e.target.value })}
                            placeholder="Enter image title"
                        />
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                        {currentImage.preview && (
                            <div className="mt-3">
                                <Image src={currentImage.preview} alt="Preview" thumbnail />
                            </div>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    <Button variant="primary" onClick={handleAddOrEditImage}>
                        {modalMode === 'add' ? 'Add Image' : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
}

export default Carousel;
