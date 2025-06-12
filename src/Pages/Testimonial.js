import React from "react";
import Slider from "react-slick";
import { FaQuoteLeft } from "react-icons/fa";
import "./Testimonials.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Sample data with name, subname, and image
const testimonials = [
  {
    heading: "Excellent Service",
    description: "Outstanding support and guidance throughout.",
    name: "John Doe",
    subname: "CEO, Company X",
    image: "https://via.placeholder.com/50" // Replace with actual image URL
  },
  {
    heading: "Highly Recommend",
    description: "Their professionalism and expertise were exceptional.",
    name: "Jane Smith",
    subname: "Founder, Company Y",
    image: "https://via.placeholder.com/50" // Replace with actual image URL
  },
  {
    heading: "Great Experience",
    description: "Every interaction was superb.",
    name: "James Lee",
    subname: "Manager, Company Z",
    image: "https://via.placeholder.com/50" // Replace with actual image URL
  },
  {
    heading: "Amazing Quality",
    description: "The products exceeded my expectations.",
    name: "Linda Taylor",
    subname: "Director, Company A",
    image: "https://via.placeholder.com/50" // Replace with actual image URL
  },
  {
    heading: "Quick Support",
    description: "Fast responses and problem-solving skills.",
    name: "Michael Brown",
    subname: "Support Lead, Company B",
    image: "https://via.placeholder.com/50" // Replace with actual image URL
  },
  {
    heading: "Wonderful Team",
    description: "They truly care about their customers.",
    name: "Emma Wilson",
    subname: "Customer Manager, Company C",
    image: "https://via.placeholder.com/50" // Replace with actual image URL
  },
];

const TestimonialsPage = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    customPaging: (i) => <div className="custom-dot"></div>,
    appendDots: (dots) => <ul className="custom-dots">{dots}</ul>,
  };

  const groupedTestimonials = [];
  for (let i = 0; i < testimonials.length; i += 3) {
    groupedTestimonials.push(testimonials.slice(i, i + 3));
  }

  return (
    <div className="testimonials-page">
      <h2 className="text-center mb-4">Testimonials</h2>
      <Slider {...settings}>
        {groupedTestimonials.map((group, index) => (
          <div key={index} className="testimonial-group">
            <div className="d-flex justify-content-center">
              {group.map((testimonial, idx) => (
                <div className="testimonial-item mx-3" key={idx}>
                  <div className="speech-bubble">
                    <FaQuoteLeft className="quote-icon" />
                    <h5>{testimonial.heading}</h5>
                    <p>{testimonial.description}</p>
                  </div>

                  {/* Footer Row outside the speech bubble */}
                  <div className="testimonial-footer d-flex align-items-center mt-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="testimonial-image rounded-circle"
                    />
                    <div className="testimonial-name ml-3">
                      <strong>{testimonial.name}</strong>
                      <p>{testimonial.subname}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TestimonialsPage;
