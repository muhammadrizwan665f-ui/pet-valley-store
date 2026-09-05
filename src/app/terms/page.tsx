import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>By using Pet Valley, you agree to provide accurate account and shipping information and to use the site only for lawful purchasing purposes.</p>
      <p>All product prices are listed in the currency shown at checkout and are subject to change without notice. Orders are only confirmed once payment is verified through PayFast.</p>
      <p>Pet Valley reserves the right to cancel or refuse any order, including for suspected fraud, pricing errors, or stock unavailability, with a full refund issued in such cases.</p>
      <p>Product descriptions and images are provided in good faith; minor variations in color or packaging between what's shown and what's delivered may occur.</p>
      <p>These terms are governed by the laws applicable to Pet Valley's registered place of business. Continued use of the site constitutes acceptance of any future updates to these terms.</p>
    </LegalPage>
  );
}
