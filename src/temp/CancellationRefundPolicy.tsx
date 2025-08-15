import React from "react";

const CancellationRefundPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Cancellation & Refund Policy</h1>
      <p className="mb-4">
        <strong>Last updated:</strong> August 14, 2025
      </p>

      <h2 className="text-2xl font-semibold mb-2">Cancellation</h2>
      <p className="mb-6">
        You may cancel your paid subscription at any time through your account
        dashboard. Your cancellation will take effect at the end of your
        current paid term. You will continue to have access to the premium
        features until the end of your billing period.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Refunds</h2>
      <p className="mb-4">
        Payments for subscriptions are non-refundable. We do not provide
        refunds or credits for any partial subscription periods or unused
        services. Once a payment is made, it is final.
      </p>
      <p className="mb-6">
        We encourage you to use our free plan to evaluate the service before
        committing to a paid subscription.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p>
        If you have any questions about our Cancellation and Refund Policy,
        please contact us at:{" "}
        <a
          href="mailto:support@sibisiddharth.me"
          className="text-blue-600 hover:underline"
        >
          support@sibisiddharth.me
        </a>
      </p>
    </div>
  );
};

export default CancellationRefundPolicy;
