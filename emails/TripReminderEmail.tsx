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

interface TripReminderEmailProps {
  name: string;
  tripTitle: string;
  destination: string;
  startDate: string;
  daysUntilTrip: number;
  tripUrl: string;
  checklist?: string[];
}

const DEFAULT_CHECKLIST = [
  "Check passport/national ID card is valid",
  "Download offline maps (Google Maps, Maps.me)",
  "Screenshot all booking confirmations",
  "Notify your bank of travel dates",
  "Check EU roaming — often free within EU!",
  "Pack your student ID for discounts",
  "Get travel insurance (cheap for students)",
  "Check the European Health Insurance Card (EHIC)",
];

export const TripReminderEmail = ({
  name = "Explorer",
  tripTitle = "My European Adventure",
  destination = "Prague, Czech Republic",
  startDate = "2026-03-01",
  daysUntilTrip = 7,
  tripUrl = "https://wandereu.app/trips/example",
  checklist = DEFAULT_CHECKLIST,
}: TripReminderEmailProps) => {
  const isUrgent = daysUntilTrip <= 1;
  const headerText =
    daysUntilTrip === 1
      ? "You leave tomorrow!"
      : daysUntilTrip === 7
      ? "One week to go!"
      : `${daysUntilTrip} days to go!`;

  return (
    <Html lang="en">
      <Head>
        <title>
          Your {destination} trip is in {daysUntilTrip} day
          {daysUntilTrip === 1 ? "" : "s"}
        </title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        `}</style>
      </Head>
      <Preview>
        {headerText} Your {destination} adventure starts on {startDate}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerEyebrow}>Trip reminder</Text>
            <Heading style={headerTitle}>{headerText}</Heading>
            <Text style={headerSubtitle}>
              {destination} · {startDate}
            </Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h2}>Ready, {name}?</Heading>
            <Text style={paragraph}>
              Your trip to <strong>{destination}</strong> is almost here.
              {isUrgent
                ? " Here's your last-minute checklist:"
                : " Here's your pre-departure checklist to make sure everything is in order:"}
            </Text>

            {/* Trip info card */}
            <Section style={infoCard}>
              <Text style={infoRow}>
                <strong>Trip:</strong> {tripTitle}
              </Text>
              <Text style={infoRow}>
                <strong>Destination:</strong> {destination}
              </Text>
              <Text style={infoRow}>
                <strong>Departure:</strong> {startDate}
              </Text>
              <Text style={{ ...infoRow, color: "#c84b31", fontWeight: 600 }}>
                <strong>Days remaining:</strong> {daysUntilTrip}
              </Text>
            </Section>

            {/* Checklist */}
            <Text style={sectionTitle}>Pre-Departure Checklist</Text>
            <Section style={checklistCard}>
              {checklist.map((item, i) => (
                <Text key={i} style={checklistItem}>
                  <span style={checkbox}>☐</span> {item}
                </Text>
              ))}
            </Section>

            {/* Student tip */}
            <Section style={tipBox}>
              <Text style={tipText}>
                🎓 <strong>Student travel tip:</strong> EU students have
                free emergency healthcare across all EU countries with the
                EHIC card. Get yours free at your national health authority
                website before you travel!
              </Text>
            </Section>

            {isUrgent && (
              <Section style={urgentBox}>
                <Text style={urgentText}>
                  🚂 <strong>Last-minute check:</strong> Confirm your first
                  night accommodation and have the address saved offline.
                  Arrive confident!
                </Text>
              </Section>
            )}

            <Button href={tripUrl} style={ctaButton}>
              Review my itinerary →
            </Button>

            <Hr style={divider} />

            <Text style={paragraph}>
              Have an amazing adventure!
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

export default TripReminderEmail;

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

const infoCard: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "0 0 20px",
  border: "1px solid #e8e4df",
};

const infoRow: React.CSSProperties = {
  fontSize: "14px",
  color: "#444444",
  margin: "0 0 8px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#888888",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const checklistCard: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "0 0 20px",
  border: "1px solid #e8e4df",
};

const checklistItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#444444",
  margin: "0 0 10px",
  lineHeight: "1.4",
};

const checkbox: React.CSSProperties = {
  color: "#c84b31",
  marginRight: "8px",
  fontSize: "16px",
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

const urgentBox: React.CSSProperties = {
  backgroundColor: "#fff3cd",
  borderLeft: "3px solid #d97706",
  padding: "12px 16px",
  borderRadius: "0 8px 8px 0",
  margin: "16px 0",
};

const urgentText: React.CSSProperties = {
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
