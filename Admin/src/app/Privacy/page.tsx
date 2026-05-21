"use client";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/Authentication/Register"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Register
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information when you use our Service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Full name, email address, and password when you register.</li>
              <li><strong>Profile Information:</strong> Avatar, phone number, bio, country, city, and postal code that you optionally provide.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with the Service, including pages visited and actions taken.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve the Service.</li>
              <li>Authenticate your identity and manage your account.</li>
              <li>Send you verification codes, password reset links, and important service notifications.</li>
              <li>Respond to your inquiries and support requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. Passwords are hashed using industry-standard algorithms. Email verification codes are stored temporarily and expire after a short period. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>With your consent or at your direction.</li>
              <li>To comply with legal obligations or respond to lawful requests.</li>
              <li>To protect the rights, property, or safety of NSPC, our users, or the public.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              We retain your account information for as long as your account is active. If you request account deletion, we will remove your personal data within a reasonable timeframe, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and review your personal information.</li>
              <li>Update or correct inaccurate information through your profile settings.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Opt out of non-essential communications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              We use essential cookies and local storage to maintain your authentication session. We do not use tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through the platform&apos;s contact form.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
