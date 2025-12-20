import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import { use, useEffect } from 'react';

export default function PrivacyPolicyPage() {

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);


  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader title="Privacy Policy" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-8"
        >
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Introduction</h2>
              <p className="text-slate-600 leading-relaxed">
                Welcome to MyMind Portfolio ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our website and services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Information We Collect</h2>
              <p className="text-slate-600 leading-relaxed mb-3">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Personal Information:</strong> When you register or contact us, we may collect your name, email address, and profile picture (via Google OAuth).</li>
                <li><strong>Usage Data:</strong> We collect information about how you interact with our website, including pages visited, time spent, and actions taken.</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience and gather analytics data.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">How We Use Your Information</h2>
              <p className="text-slate-600 leading-relaxed mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Authenticate your identity via Google OAuth</li>
                <li>Respond to your inquiries and contact requests</li>
                <li>Improve our website and user experience</li>
                <li>Send you updates and notifications (with your consent)</li>
                <li>Analyze usage patterns and generate analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Third-Party Services</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                We use the following third-party services that may collect information:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Google OAuth:</strong> For authentication and login services</li>
                <li><strong>Microsoft Clarity:</strong> For website analytics and user behavior tracking</li>
                <li><strong>Google Analytics:</strong> For website traffic and usage analysis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Data Security</h2>
              <p className="text-slate-600 leading-relaxed">
                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, 
                disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Rights</h2>
              <p className="text-slate-600 leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Access and review your personal data</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Cookies</h2>
              <p className="text-slate-600 leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                You can manage your cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Children's Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page 
                and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions or concerns about this privacy policy or our data practices, please contact us at:{' '}
                <a href="mailto:sibisiddharth8@gmail.com" className="text-blue-600 hover:underline">
                  sibisiddharth8@gmail.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
