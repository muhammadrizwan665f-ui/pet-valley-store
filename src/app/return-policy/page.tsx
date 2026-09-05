import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Return Policy" };

export default function ReturnPolicyPage() {
  return (
    <LegalPage title="Return Policy">
      <p>We accept returns of unused, unopened items within 30 days of delivery. To start a return, contact us via the Contact Us page with your order number.</p>
      <p>Once a return is received and inspected, refunds are issued to the original payment method through PayFast within 5–10 business days.</p>
      <p>Items that are used, damaged through misuse, or missing original packaging may not be eligible for a full refund.</p>
      <p>Perishable items, and items marked as final sale at the time of purchase, are not eligible for return.</p>
      <p>If your order arrived damaged or incorrect, contact us immediately and we'll arrange a replacement or refund at no additional cost to you.</p>
    </LegalPage>
  );
}
