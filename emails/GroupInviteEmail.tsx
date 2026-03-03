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

interface GroupInviteEmailProps {
  inviterName: string;
  recipientName?: string;
  tripTitle: string;
  destination: string;
  originCity?: string;
  startDate: string;
  endDate?: string;
  totalDays?: number;
  budgetTotal?: number;
  groupSize?: number;
  inviteCode: string;
  inviteUrl: string;
  personalMessage?: string;
}

export const GroupInviteEmail = ({
  inviterName = "Your friend",
  recipientName,
  tripTitle = "European Adventure",
  destination = "Prague, Czech Republic",
  originCity,
  startDate = "2026-03-01",
  endDate,
  totalDays,
  budgetTotal,
  groupSize,
  inviteCode = "WANDER24",
  inviteUrl = "https://wandereu.app/join/WANDER24",
  personalMessage,
}: GroupInviteEmailProps) => {
  const greeting = recipientName ? `Hi ${recipientName}!` : "Hey there!";

  return (
    <Html lang="en">
      <Head>
        <title>
          {inviterName} invited you to a WanderEU trip to {destination}
        </title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        `}</style>
      </Head>
      <Preview>
        {inviterName} wants you to join their {destination} trip on WanderEU —
        accept the invite!
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerEyebrow}>You're invited!</Text>
            <Heading style={headerTitle}>{destination}</Heading>
            <Text style={headerSubtitle}>
              {inviterName} wants you on this trip
            </Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h2}>{greeting}</Heading>

            {personalMessage ? (
              <>
                <Text style={paragraph}>
                  <strong>{inviterName}</strong> sent you a personal message:
                </Text>
                <Section style={messageBox}>
                  <Text style={messageText}>"{personalMessage}"</Text>
                  <Text style={messageAuthor}>— {inviterName}</Text>
                </Section>
              </>
            ) : (
              <Text style={paragraph}>
                <strong>{inviterName}</strong> is planning a trip to{" "}
                <strong>{destination}</strong> using WanderEU and wants you to
                join. Accept the invite to see the full itinerary and start
                planning together!
              </Text>
            )}

            {/* Trip details card */}
            <Section style={tripCard}>
              <Text style={tripCardTitle}>{tripTitle}</Text>
              <Hr style={innerDivider} />

              <Section style={detailRow}>
                <Text style={detailLabel}>Destination</Text>
                <Text style={detailValue}>{destination}</Text>
              </Section>

              {originCity && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>From</Text>
                  <Text style={detailValue}>{originCity}</Text>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailLabel}>Start date</Text>
                <Text style={detailValue}>{startDate}</Text>
              </Section>

              {endDate && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>End date</Text>
                  <Text style={detailValue}>{endDate}</Text>
                </Section>
              )}

              {totalDays && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>Duration</Text>
                  <Text style={detailValue}>
                    {totalDays} day{totalDays === 1 ? "" : "s"}
                  </Text>
                </Section>
              )}

              {budgetTotal && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>Budget per person</Text>
                  <Text style={{ ...detailValue, color: "#c84b31", fontWeight: 600 }}>
                    €{budgetTotal}
                  </Text>
                </Section>
              )}

              {groupSize && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>Group size</Text>
                  <Text style={detailValue}>
                    {groupSize} traveller{groupSize === 1 ? "" : "s"}
                  </Text>
                </Section>
              )}
            </Section>

            {/* Invite code */}
            <Section style={inviteCodeBox}>
              <Text style={inviteCodeLabel}>Your invite code</Text>
              <Text style={inviteCodeValue}>{inviteCode}</Text>
              <Text style={inviteCodeHint}>
                Use this code at wandereu.app/join or click the button below
              </Text>
            </Section>

            <Button href={inviteUrl} style={ctaButton}>
              Join {inviterName}'s trip →
            </Button>

            {/* What is WanderEU */}
            <Section style={infoBox}>
              <Text style={infoTitle}>New to WanderEU?</Text>
              <Text style={infoText}>
                WanderEU is a free trip planner for EU students. AI generates
                full itineraries with student discounts, budget tracking, and
                group planning. Create your free account when you join the trip.
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={finePrint}>
              This invite was sent on behalf of {inviterName}. If you weren't
              expecting this, you can safely ignore this email.
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

export default GroupInviteEmail;

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

const messageBox: React.CSSProperties = {
  backgroundColor: "#fff8f5",
  borderLeft: "3px solid #c84b31",
  padding: "16px 20px",
  borderRadius: "0 8px 8px 0",
  margin: "0 0 20px",
};

const messageText: React.CSSProperties = {
  fontSize: "15px",
  color: "#333333",
  fontStyle: "italic",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const messageAuthor: React.CSSProperties = {
  fontSize: "13px",
  color: "#888888",
  margin: 0,
};

const tripCard: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  margin: "0 0 24px",
  border: "1px solid #e8e4df",
};

const tripCardTitle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  fontSize: "18px",
  fontWeight: 400,
  color: "#1a1a1a",
  margin: "0 0 12px",
};

const innerDivider: React.CSSProperties = {
  borderColor: "#e8e4df",
  margin: "12px 0 16px",
};

const detailRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "0 0 8px",
};

const detailLabel: React.CSSProperties = {
  fontSize: "13px",
  color: "#888888",
  margin: 0,
};

const detailValue: React.CSSProperties = {
  fontSize: "14px",
  color: "#1a1a1a",
  margin: 0,
  textAlign: "right",
};

const inviteCodeBox: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  borderRadius: "12px",
  padding: "24px",
  margin: "0 0 24px",
  textAlign: "center",
};

const inviteCodeLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.5)",
  textTransform: "uppercase",
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const inviteCodeValue: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  fontSize: "36px",
  color: "#c84b31",
  letterSpacing: "4px",
  margin: "0 0 8px",
};

const inviteCodeHint: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.5)",
  margin: 0,
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
  margin: "0 0 24px",
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#f0ede8",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0 0",
};

const infoTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#1a1a1a",
  margin: "0 0 6px",
};

const infoText: React.CSSProperties = {
  fontSize: "13px",
  color: "#555555",
  lineHeight: "1.5",
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#e8e4df",
  margin: "24px 0",
};

const finePrint: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaaaaa",
  lineHeight: "1.5",
  margin: 0,
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
