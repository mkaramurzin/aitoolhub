export type TermsProps = {};

function TermsPage({}: TermsProps) {
  return (
    <div className="p-5 font-sans leading-relaxed">
      <h1 className="mb-4 text-3xl font-bold">Terms &amp; Conditions</h1>
      <p className="mb-6">
        <strong>Effective Date — April 17th, 2025</strong>
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing and using AiToolHub.co (the &quot;Site&quot;), you agree to be bound
        by these Terms &amp; Conditions. If you do not agree, please do not use
        the Site.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">2. Use of the Site</h2>
      <p className="mb-4">
        You may browse the Site and submit reviews or tools as long as you
        comply with these Terms and all applicable laws. You may not use the
        Site to post unlawful, harmful, or misleading content.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">3. User Accounts</h2>
      <p className="mb-4">
        If you create an account, you are responsible for maintaining its
        security. We may suspend or terminate your account if you violate these
        Terms.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">4. Intellectual Property</h2>
      <p className="mb-4">
        The Site and its content are owned by Ashco LLC or its licensors. You
        may not copy or redistribute any portion of the Site without our written
        permission.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">5. Disclaimers</h2>
      <p className="mb-4">
        The Site is provided &quot;as is&quot; without warranties of any kind. We are not
        liable for any damages arising from your use of the Site.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">6. Changes to These Terms</h2>
      <p className="mb-4">
        We may update these Terms from time to time. Material changes will be
        posted on the Site with an updated effective date.
      </p>

      <h2 className="mb-2 mt-8 text-2xl font-semibold">7. Contact Us</h2>
      <p className="mb-4">
        If you have questions about these Terms, email {" "}
        <a href="mailto:hello@aitoolhub.co" className="text-blue-500 hover:underline">
          hello@aitoolhub.co
        </a>
        .
      </p>
    </div>
  );
}

export default TermsPage;
