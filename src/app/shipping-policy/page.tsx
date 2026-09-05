import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <LegalPage title="Shipping Policy">
      <p>We ship to the USA, UK, Canada, Australia, and other international destinations. Shipping costs and delivery estimates are calculated at checkout based on destination and order value.</p>
      <p>Orders over the free-shipping threshold (shown in the announcement bar and at checkout) ship free. All other orders are charged the flat shipping rate configured by the store.</p>
      <p>Estimated delivery windows are typically 7–14 business days for international orders, though customs processing in some countries may extend this.</p>
      <p>Once an order ships, tracking information is available on the order's page under My Orders and is updated as the carrier reports progress.</p>
      <p>Pet Valley is not responsible for delays caused by customs authorities, incorrect address information provided at checkout, or events outside our carriers' control.</p>
    </LegalPage>
  );
}
