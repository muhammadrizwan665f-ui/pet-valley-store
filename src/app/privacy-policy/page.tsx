import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Pet Valley collects the information necessary to process your orders: your name, email, shipping and billing addresses, and order history. Payment details are handled entirely by PayFast — we never store your card or bank information on our servers.</p>
      <p>We use your email to send order confirmations, shipping updates, and — only if you opt in — marketing communications, which you can unsubscribe from at any time.</p>
      <p>We do not sell your personal information to third parties. Data is shared only with the service providers necessary to fulfil your order, such as our payment processor and, once configured, our shipping and email providers.</p>
      <p>You may request a copy of your data or ask us to delete your account by contacting us via the Contact Us page.</p>
      <p>Passwords are stored using industry-standard hashing and are never visible to Pet Valley staff.</p>
    </LegalPage>
  );
}
