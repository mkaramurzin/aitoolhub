export type PrivacyPolicyProps = {};

function PrivacyPolicy({}: PrivacyPolicyProps) {
  return (
    <div className="p-5 font-sans leading-relaxed">
      <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-6">
        <strong>Effective Date — April 17th, 2025</strong>
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">1. Who We Are</h2>
      <p className="mb-4">
        AIToolHub.co is operated by Ashco LLC, a Washington–registered company
        (“we,” “us,” or “our”). This policy explains how we collect, use, store,
        share, and protect your information when you visit{" "}
        <a
          href="https://aitoolhub.co"
          className="text-blue-500 hover:underline"
        >
          https://aitoolhub.co
        </a>{" "}
        (the “Site”) or interact with our services.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">
        2. Information We Collect
      </h2>
      <ul className="mb-4 ml-6 list-disc space-y-1">
        <li>
          <strong>Account &amp; Contact Data:</strong> Email address and, if
          supplied, your name.
        </li>
        <li>
          <strong>User‑Generated Content:</strong> Reviews, comments, and tool
          submissions you choose to publish.
        </li>
        <li>
          <strong>Usage Data:</strong> IP address, browser type, device
          identifiers, pages viewed, clicks, and referring URLs (captured via
          Google Analytics 4 cookies).
        </li>
        <li>
          <strong>Payment Data (future):</strong> Limited billing details (e.g.,
          last four digits of card, transaction ID) processed by Stripe.
        </li>
      </ul>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">
        3. How We Use Your Data
      </h2>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Legal Basis</th>
              <th className="border px-4 py-2">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Contract</td>
              <td className="border px-4 py-2">
                Create/manage accounts; (future) process Stripe payments
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Legitimate Interests</td>
              <td className="border px-4 py-2">
                Improve the Site, analyze traffic, prevent fraud, maintain
                security
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Consent</td>
              <td className="border px-4 py-2">
                Send marketing emails, place non‑essential cookies, display user
                content
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Legal Obligation</td>
              <td className="border px-4 py-2">
                Comply with laws and lawful requests
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">
        4. Cookies &amp; Tracking
      </h2>
      <p className="mb-4">
        We set essential cookies for security and login sessions and use Google
        Analytics 4 for performance metrics. EU/UK visitors see a consent
        banner. You can disable cookies in your browser settings.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">5. AI Processing</h2>
      <p className="mb-4">
        To polish tool descriptions and reviews, we send text to OpenAI’s GPT
        API for transient processing; only the returned output is stored on our
        servers.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">6. Data Sharing</h2>
      <p className="mb-2">
        We do not sell your personal data. We share it only with:
      </p>
      <ul className="mb-4 ml-6 list-disc space-y-1">
        <li>Namecheap (hosting)</li>
        <li>Google Analytics 4 (usage metrics)</li>
        <li>OpenAI (AI text processing)</li>
        <li>Email infrastructure (newsletters &amp; transactional mail)</li>
        <li>Stripe (payment processing, once live)</li>
      </ul>
      <p className="mb-4">
        All vendors act under our instructions and keep data confidential.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">
        7. International Transfers
      </h2>
      <p className="mb-4">
        Data is stored on U.S. servers. For EU/UK visitors, cross‑border
        transfers rely on Standard Contractual Clauses or any successor
        mechanism.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">8. Data Retention</h2>
      <p className="mb-4">
        Account data &amp; published content – Kept until you request deletion.
        <br />
        Analytics logs – Retained up to 26 months, then aggregated.
        <br />
        Back‑ups – Encrypted and purged within 90 days.
        <br />
        Email{" "}
        <a
          href="mailto:hello@aitoolhub.co"
          className="text-blue-500 hover:underline"
        >
          hello@aitoolhub.co
        </a>{" "}
        to request access, correction, export, or deletion; we respond within 30
        days.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">9. Security Measures</h2>
      <p className="mb-4">
        TLS/HTTPS on every page, encryption at rest, role‑based access controls,
        regular patching, and monitoring. No online service can promise absolute
        security, but we take reasonable steps to protect your data.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">10. Your Rights</h2>
      <p className="mb-4">
        EU/UK residents – Access, rectify, delete, restrict, object, or port
        data; withdraw consent at any time.
        <br />
        California residents – Rights to know, delete, and opt‑out (we do not
        sell data); no discrimination for exercising rights.
        <br />
        We honor Do Not Track and Global Privacy Control signals by disabling
        non‑essential cookies for that session.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">
        11. Children’s Privacy
      </h2>
      <p className="mb-4">
        The Site is not directed to children under 13 and we do not knowingly
        collect their data. If you believe we have, contact us and we will
        delete it promptly.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">
        12. Changes to This Policy
      </h2>
      <p className="mb-4">
        We may update this Privacy Policy occasionally. Material changes will be
        posted on the Site or sent by email, and the “Effective Date” will
        reflect the latest revision.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">13. Contact Us</h2>
      <p className="mb-4">
        For privacy questions or to obtain our full registered mailing address,
        email{" "}
        <a
          href="mailto:hello@aitoolhub.co"
          className="text-blue-500 hover:underline"
        >
          hello@aitoolhub.co
        </a>
        .
      </p>
    </div>
  );
}

export default PrivacyPolicy;
