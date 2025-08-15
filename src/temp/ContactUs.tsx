import React from "react";

const ContactUs: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="mb-4">
        If you have any questions, concerns, or feedback about our service,
        please do not hesitate to reach out.
      </p>
      <p className="mb-4">You can contact our support team via email:</p>
      <h2 className="text-xl font-semibold mb-4">
        <a
          href="mailto:support@sibisiddharth.me"
          className="text-blue-600 hover:underline"
        >
          support@sibisiddharth.me
        </a>
      </h2>
      <p>We aim to respond to all inquiries within 24-48 hours.</p>
    </div>
  );
};

export default ContactUs;
