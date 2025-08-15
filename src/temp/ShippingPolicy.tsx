import React from "react";

const ShippingPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Shipping Policy</h1>
      <h2 className="text-2xl font-semibold mb-2">Digital Service Delivery</h2>
      <p className="mb-4">
        Our uptime monitoring service is a fully digital product. Access to the
        service and its features is provided electronically immediately after a
        successful subscription payment.
      </p>
      <p className="font-semibold">
        No physical products are shipped, and therefore, no shipping costs are
        incurred.
      </p>
    </div>
  );
};

export default ShippingPolicy;
