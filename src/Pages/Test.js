import React from "react";
import { Carousel } from "react-bootstrap";
import { FaQuoteLeft } from "react-icons/fa";
import "./Testimonials.css";

const testimonials = [
  {
    heading: "Excellent Service",
    description: "The team provided outstanding support and guidance throughout.",
  },
  {
    heading: "Highly Recommend",
    description: "Their professionalism and expertise were exceptional.",
  },
  {
    heading: "Great Experience",
    description: "I loved every interaction with this company. Superb!",
  },
  {
    heading: "Amazing Quality",
    description: "The products were top-notch and exceeded my expectations.",
  },
  {
    heading: "Quick Support",
    description: "Fast responses and excellent problem-solving skills.",
  },
  {
    heading: "Wonderful Team",
    description: "They truly care about their customers. A+ experience.",
  },
];

const TestimonialsPage = () => {
  const groupedTestimonials = [];
  for (let i = 0; i < testimonials.length; i += 3) {
    groupedTestimonials.push(testimonials.slice(i, i + 3));
  }

  return (
    <div className="testimonials-page">
      <h2 className="text-center mb-4">Testimonials</h2>
      <Carousel>
        {groupedTestimonials.map((group, index) => (
          <Carousel.Item key={index}>
            <div className="d-flex justify-content-center">
              {group.map((testimonial, idx) => (
                <div className="testimonial-item mx-3" key={idx}>
                  <div className="speech-bubble">
                    <FaQuoteLeft className="quote-icon" />
                    <h5>{testimonial.heading}</h5>
                    <p>{testimonial.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default TestimonialsPage;
