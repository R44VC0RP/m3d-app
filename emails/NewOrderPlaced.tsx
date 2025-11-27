import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

// Design system colors matching Mandarin3D branding
const designSystem = {
  colors: {
    primary: '#466F80',
    secondary: '#334E58',
    background: {
      outside: '#F5F5F5',
      card: '#FFFFFF',
    },
    text: {
      primary: '#121113',
      secondary: '#454139',
      tertiary: '#6B6B6B',
      info: '#466F80',
    },
    border: {
      main: '#E5E5E5',
    },
  },
};

interface LineItem {
  title: string;
  quantity: number;
  price: string;
  fileId?: string;
  fileName?: string;
}

interface NewOrderPlacedEmailProps {
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  totalPrice?: string;
  currency?: string;
  lineItems?: LineItem[];
  hasMulticolor?: boolean;
  hasPriority?: boolean;
  needsAssistance?: boolean;
  orderNote?: string;
  shippingAddress?: {
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  } | undefined;
  shopifyAdminUrl?: string;
  companyAddress?: string;
}

export const NewOrderPlacedEmail = ({
  orderNumber = '#1001',
  customerName = 'John Doe',
  customerEmail = 'john@example.com',
  totalPrice = '49.99',
  currency = 'USD',
  lineItems = [
    { title: 'Custom 3D Print', quantity: 1, price: '24.99', fileName: 'model.stl' },
    { title: 'Custom 3D Print', quantity: 2, price: '25.00', fileName: 'bracket.stl' },
  ],
  hasMulticolor = false,
  hasPriority = false,
  needsAssistance = false,
  orderNote = undefined,
  shippingAddress = {
    address1: '123 Main St',
    city: 'Jacksonville',
    province: 'FL',
    country: 'US',
    zip: '32256',
  },
  shopifyAdminUrl = 'https://mandarin3d.myshopify.com/admin/orders',
  companyAddress = 'Mandarin 3D Prints, Jacksonville, FL',
}: NewOrderPlacedEmailProps) => {
  const ds = designSystem;
  const previewText = `New order ${orderNumber} placed by ${customerName}`;

  // Determine if there are any special flags
  const hasSpecialFlags = hasMulticolor || hasPriority || needsAssistance;

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrX2B4qb1w2wX7DPI.woff2',
            format: 'woff2',
          }}
          fontWeight={500}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrX2B4qb1w2wX7DPI.woff2',
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body
          className="mx-auto my-auto px-2"
          style={{
            backgroundColor: ds.colors.background.outside,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, Arial, sans-serif',
          }}
        >
          <Container className="mx-auto my-[24px] max-w-[600px]">
            {/* Main Card */}
            <Section
              className="rounded-[12px] border border-solid bg-white"
              style={{ borderColor: ds.colors.border.main }}
            >
              <Section className="p-[24px]">
                {/* Logo / Header */}
                <Section className="mb-[16px]">
                  <Text
                    className="m-0 text-[20px] font-semibold tracking-tight"
                    style={{ color: ds.colors.primary }}
                  >
                    Mandarin 3D Prints
                  </Text>
                </Section>

                {/* Main Heading */}
                <Heading
                  className="mt-[12px] mb-[8px] p-0 text-[20px] font-semibold"
                  style={{ color: ds.colors.text.primary }}
                >
                  🎉 New Order Received
                </Heading>

                <Text
                  className="mt-0 mb-[16px] text-[14px] leading-[1.6]"
                  style={{ color: ds.colors.text.tertiary }}
                >
                  A new order has been placed and is ready for review.
                </Text>

                {/* Special Flags Alert */}
                {hasSpecialFlags && (
                  <Section
                    className="mb-[16px] rounded-[8px] p-[12px]"
                    style={{ backgroundColor: '#FEF3C7' }}
                  >
                    <Text
                      className="m-0 text-[13px] font-semibold"
                      style={{ color: '#92400E' }}
                    >
                      ⚠️ Special Attention Required:
                    </Text>
                    {hasMulticolor && (
                      <Text className="m-0 mt-[4px] text-[12px]" style={{ color: '#92400E' }}>
                        • Multicolor printing requested
                      </Text>
                    )}
                    {hasPriority && (
                      <Text className="m-0 mt-[4px] text-[12px]" style={{ color: '#92400E' }}>
                        • Priority queue (rush order)
                      </Text>
                    )}
                    {needsAssistance && (
                      <Text className="m-0 mt-[4px] text-[12px]" style={{ color: '#92400E' }}>
                        • Customer needs design assistance
                      </Text>
                    )}
                  </Section>
                )}

                {/* Order Info Box */}
                <Section
                  className="mb-[16px] rounded-[8px] p-[16px]"
                  style={{ backgroundColor: '#F9FAFB' }}
                >
                  <Text
                    className="m-0 text-[12px] font-semibold uppercase tracking-wide"
                    style={{ color: ds.colors.text.tertiary }}
                  >
                    Order Details
                  </Text>
                  
                  <Section className="mt-[12px]">
                    <Text className="m-0 text-[13px]" style={{ color: ds.colors.text.secondary }}>
                      <span className="font-semibold" style={{ color: ds.colors.text.primary }}>
                        Order:
                      </span>{' '}
                      {orderNumber}
                    </Text>
                    <Text className="m-0 mt-[4px] text-[13px]" style={{ color: ds.colors.text.secondary }}>
                      <span className="font-semibold" style={{ color: ds.colors.text.primary }}>
                        Customer:
                      </span>{' '}
                      {customerName}
                    </Text>
                    <Text className="m-0 mt-[4px] text-[13px]" style={{ color: ds.colors.text.secondary }}>
                      <span className="font-semibold" style={{ color: ds.colors.text.primary }}>
                        Email:
                      </span>{' '}
                      <Link href={`mailto:${customerEmail}`} style={{ color: ds.colors.text.info }}>
                        {customerEmail}
                      </Link>
                    </Text>
                    <Text className="m-0 mt-[4px] text-[13px]" style={{ color: ds.colors.text.secondary }}>
                      <span className="font-semibold" style={{ color: ds.colors.text.primary }}>
                        Total:
                      </span>{' '}
                      <span className="font-semibold" style={{ color: ds.colors.primary }}>
                        ${totalPrice} {currency}
                      </span>
                    </Text>
                  </Section>
                </Section>

                {/* Line Items */}
                <Section className="mb-[16px]">
                  <Text
                    className="m-0 mb-[8px] text-[12px] font-semibold uppercase tracking-wide"
                    style={{ color: ds.colors.text.tertiary }}
                  >
                    Items ({lineItems.length})
                  </Text>
                  
                  {lineItems.map((item, index) => (
                    <Section
                      key={index}
                      className="mb-[8px] rounded-[6px] border border-solid p-[12px]"
                      style={{ borderColor: ds.colors.border.main }}
                    >
                      <Text className="m-0 text-[13px] font-semibold" style={{ color: ds.colors.text.primary }}>
                        {item.title}
                      </Text>
                      {item.fileName && (
                        <Text className="m-0 mt-[2px] text-[12px]" style={{ color: ds.colors.text.tertiary }}>
                          📁 {item.fileName}
                        </Text>
                      )}
                      <Text className="m-0 mt-[4px] text-[12px]" style={{ color: ds.colors.text.secondary }}>
                        Qty: {item.quantity} × ${item.price}
                      </Text>
                    </Section>
                  ))}
                </Section>

                {/* Shipping Address */}
                {shippingAddress && (
                  <Section className="mb-[16px]">
                    <Text
                      className="m-0 mb-[8px] text-[12px] font-semibold uppercase tracking-wide"
                      style={{ color: ds.colors.text.tertiary }}
                    >
                      Shipping To
                    </Text>
                    <Text className="m-0 text-[13px]" style={{ color: ds.colors.text.secondary }}>
                      {shippingAddress.address1}
                      <br />
                      {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}
                      <br />
                      {shippingAddress.country}
                    </Text>
                  </Section>
                )}

                {/* Order Note */}
                {orderNote && (
                  <Section
                    className="mb-[16px] rounded-[8px] p-[12px]"
                    style={{ backgroundColor: '#EFF6FF', borderLeft: `3px solid ${ds.colors.primary}` }}
                  >
                    <Text
                      className="m-0 text-[12px] font-semibold uppercase tracking-wide"
                      style={{ color: ds.colors.primary }}
                    >
                      Customer Note
                    </Text>
                    <Text className="m-0 mt-[8px] text-[13px]" style={{ color: ds.colors.text.secondary }}>
                      "{orderNote}"
                    </Text>
                  </Section>
                )}

                {/* CTA Button */}
                <Section className="mt-[20px] mb-[16px] text-center">
                  <Link
                    href={shopifyAdminUrl}
                    className="inline-block rounded-[8px] px-[24px] py-[12px] text-[14px] font-semibold no-underline"
                    style={{
                      backgroundColor: ds.colors.primary,
                      color: '#FFFFFF',
                    }}
                  >
                    View in Shopify Admin
                  </Link>
                </Section>

                <Hr
                  className="mx-0 my-[16px] w-full border border-solid"
                  style={{ borderColor: ds.colors.border.main }}
                />

                {/* Footer */}
                <Text
                  className="m-0 text-center text-[11px]"
                  style={{ color: ds.colors.text.tertiary }}
                >
                  {companyAddress}
                </Text>
                <Text
                  className="m-0 mt-[4px] text-center text-[11px]"
                  style={{ color: ds.colors.text.tertiary }}
                >
                  This is an internal notification email.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

NewOrderPlacedEmail.PreviewProps = {
  orderNumber: '#1042',
  customerName: 'Sarah Johnson',
  customerEmail: 'sarah.johnson@example.com',
  totalPrice: '127.50',
  currency: 'USD',
  lineItems: [
    { title: 'Custom 3D Print - PLA', quantity: 2, price: '45.00', fileName: 'phone_stand_v2.stl' },
    { title: 'Custom 3D Print - PETG', quantity: 1, price: '37.50', fileName: 'wall_mount.stl' },
  ],
  hasMulticolor: true,
  hasPriority: false,
  needsAssistance: false,
  orderNote: 'Please make sure the color matches the sample I sent previously. Thanks!',
  shippingAddress: {
    address1: '456 Ocean Blvd',
    city: 'Jacksonville Beach',
    province: 'FL',
    country: 'US',
    zip: '32250',
  },
  shopifyAdminUrl: 'https://mandarin3d.myshopify.com/admin/orders/1042',
  companyAddress: 'Mandarin 3D Prints, Jacksonville, FL',
} as NewOrderPlacedEmailProps;

export default NewOrderPlacedEmail;

