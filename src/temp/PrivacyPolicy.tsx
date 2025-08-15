import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        <strong>Last updated:</strong> August 14, 2025
      </p>
      <p className="mb-6">
        This Privacy Policy describes Our policies and procedures on the
        collection, use and disclosure of Your information when You use the
        Service and tells You about Your privacy rights and how the law protects
        You.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
      <p className="mb-2">We may collect the following types of information:</p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>
          <strong>Personal Information:</strong> When you register for an
          account, we collect your name and email address. If you sign up using
          a third-party service like Google or GitHub, we receive information
          from that service as permitted by your privacy settings.
        </li>
        <li>
          <strong>Payment Information:</strong> When you subscribe to a paid
          plan, all payment processing is handled by our third-party payment
          processor, Razorpay. We do not store or have access to your credit
          card details.
        </li>
        <li>
          <strong>Usage Data:</strong> We collect data related to your use of
          our service, such as the URLs you monitor, ping logs, response times,
          and uptime statistics.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
      <p className="mb-2">We use the information we collect to:</p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>Provide, operate, and maintain our Service.</li>
        <li>Process your subscription payments.</li>
        <li>
          Communicate with you, including sending service alerts and reports.
        </li>
        <li>Improve and personalize our Service.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, you can contact us
        at:{" "}
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

export default PrivacyPolicy;
