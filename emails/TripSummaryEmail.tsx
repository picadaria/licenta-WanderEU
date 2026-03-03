import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TripSummaryEmailProps {
  name: string;
  tripTitle: string;
  destination: string;
  originCity: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  budgetTotal: number;
  budgetBreakdown: {
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    other: number;
  };
  totalActivities: number;
  tripUrl: string;
  highlights?: string[];
}

export const TripSummaryEmail = ({
  name = "Explorer",
  tripTitle = "My European Adventure",
  destination = "Prague, Czech Republic",
  originCity = "Bucharest",
  startDate = "2026-03-01",
  endDate = "2026-03-07",
  totalDays = 7,
  budgetTotal = 400,
  budgetBreakdown = {
    transport: 80,
    accommodation: 140,
    food: 105,
    activities: 55,
    other: 20,
  },
  totalActivities = 28,
  tripUrl = "https://wandereu.app/trips/example",
  highlights = [],
}: TripSummaryEmailProps) => {
  const budgetItems = [
    { label: "Transport", amount: budgetBreakdown.transport, emoji: "🚂" },
    { label: "Accommodation", amount: budgetBreakdown.accommodation, emoji: "🏨" },
    { label: "Food", amount: budgetBreakdown.food, emoji: "🍽️" },
    { label: "Activities", amount: budgetBreakdown.activities, emoji: "🎭" },
    { label: "Other", amount: budgetBreakdown.other, emoji: "💰" },
  ];

  return (
    <Html lang="en">
      <Head>
        <title>Your WanderEU itinerary is ready</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        `}</style>
      </Head>
      <Preview>
        {`Your ${totalDays}-day trip to ${destination} is ready — €${budgetTotal} budget`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerEyebrow}>Your itinerary is ready</Text>
            <Heading style={headerTitle}>{destination}</Heading>
            <Text style={headerSubtitle}>
              {originCity} → {destination.split(",")[0]} · {totalDays} days
            </Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h2}>
              {tripTitle}
            </Heading>
            <Text style={paragraph}>
              Hi {name}, your AI-generated itinerary is ready to explore. Here's
              a summary of what WanderEU planned for your trip:
            </Text>

            {/* Stats row */}
            <Section style={statsCard}>
              <Section style={statRow}>
                <Section style={stat}>
                  <Text style={statValue}>{totalDays}</Text>
                  <Text style={statLabel}>Days</Text>
                </Section>
                <Section style={stat}>
                  <Text style={statValue}>€{budgetTotal}</Text>
                  <Text style={statLabel}>Budget</Text>
                </Section>
                <Section style={stat}>
                  <Text style={statValue}>{totalActivities}</Text>
                  <Text style={statLabel}>Activities</Text>
                </Section>
              </Section>
              <Hr style={innerDivider} />
              <Text style={tripMeta}>
                <strong>Dates:</strong> {startDate} → {endDate}
              </Text>
            </Section>

            {/* Budget breakdown */}
            <Text style={sectionTitle}>Budget Breakdown</Text>
            <Section style={card}>
              {budgetItems.map((item) => (
                <Section key={item.label} style={budgetRow}>
                  <Text style={budgetLabel}>
                    {item.emoji} {item.label}
                  </Text>
                  <Text style={budgetAmount}>€{item.amount}</Text>
                </Section>
              ))}
              <Hr style={innerDivider} />
              <Section style={budgetRow}>
                <Text style={{ ...budgetLabel, fontWeight: 700 }}>Total</Text>
                <Text style={{ ...budgetAmount, fontWeight: 700, color: "#c84b31" }}>
                  €{budgetTotal}
                </Text>
              </Section>
            </Section>

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <>
                <Text style={sectionTitle}>Itinerary Highlights</Text>
                <Section style={card}>
                  {highlights.map((h, i) => (
                    <Text key={i} style={highlightItem}>
                      ✦ {h}
                    </Text>
                  ))}
                </Section>
              </>
            )}

            <Section style={tipBox}>
              <Text style={tipText}>
                💡 <strong>Tip:</strong> Chat with Wanda, your AI travel
                assistant, to modify any part of the itinerary — swap
                restaurants, change activities, or adjust your budget splits.
              </Text>
            </Section>

            <Button href={tripUrl} style={ctaButton}>
              View full itinerary →
            </Button>

            <Hr style={divider} />
            <Text style={paragraph}>
              Have a wonderful trip,
              <br />
              <em>The WanderEU Team</em>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              WanderEU — Budget travel for EU students
              <br />
              <Link href="#" style={footerLink}>
                Unsubscribe
              </Link>{" "}
              &nbsp;|&nbsp;{" "}
              <Link href="#" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TripSummaryEmail;

// ─── Styles ───────────────────────────────────────────────────────────────────
const body: React.CSSProperties = {
  backgroundColor: "#faf9f7",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#faf9f7",
};

const header: React.CSSProperties = {
  backgroundColor: "#c84b31",
  padding: "40px 40px 32px",
  textAlign: "center",
};

const headerEyebrow: React.CSSProperties = {
  color: "rgba(255,255,255,0.7)",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const headerTitle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: 400,
  letterSpacing: "-0.5px",
  margin: "0 0 8px",
};

const headerSubtitle: React.CSSProperties = {
  color: "rgba(255,255,255,0.8)",
  fontSize: "14px",
  margin: 0,
};

const bodySection: React.CSSProperties = {
  padding: "40px",
};

const h2: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  fontSize: "22px",
  fontWeight: 400,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#444444",
  margin: "0 0 14px",
};

const statsCard: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  margin: "20px 0",
  border: "1px solid #e8e4df",
};

const statRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  textAlign: "center",
};

const stat: React.CSSProperties = {
  textAlign: "center",
  display: "inline-block",
  margin: "0 16px",
};

const statValue: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  fontSize: "28px",
  color: "#c84b31",
  margin: "0 0 4px",
  lineHeight: 1,
};

const statLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#888888",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: 0,
};

const tripMeta: React.CSSProperties = {
  fontSize: "14px",
  color: "#555555",
  margin: "8px 0 0",
};

const innerDivider: React.CSSProperties = {
  borderColor: "#e8e4df",
  margin: "16px 0",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#888888",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: "24px 0 8px",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "0 0 20px",
  border: "1px solid #e8e4df",
};

const budgetRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "0 0 8px",
};

const budgetLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#444444",
  margin: 0,
};

const budgetAmount: React.CSSProperties = {
  fontSize: "14px",
  color: "#1a1a1a",
  margin: 0,
};

const highlightItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#444444",
  margin: "0 0 8px",
  lineHeight: "1.5",
};

const tipBox: React.CSSProperties = {
  backgroundColor: "#fff8f5",
  borderLeft: "3px solid #c84b31",
  padding: "12px 16px",
  borderRadius: "0 8px 8px 0",
  margin: "16px 0",
};

const tipText: React.CSSProperties = {
  fontSize: "13px",
  color: "#555555",
  margin: 0,
  lineHeight: "1.5",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#c84b31",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "15px",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px 0 24px",
};

const divider: React.CSSProperties = {
  borderColor: "#e8e4df",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f0ede8",
  padding: "24px 40px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#888888",
  lineHeight: "1.5",
  margin: 0,
};

const footerLink: React.CSSProperties = {
  color: "#c84b31",
  textDecoration: "none",
};
