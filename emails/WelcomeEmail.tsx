import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  dashboardUrl?: string;
}

export const WelcomeEmail = ({
  name = "Explorer",
  dashboardUrl = "https://wandereu.app/dashboard",
}: WelcomeEmailProps) => {
  return (
    <Html lang="en">
      <Head>
        <title>Welcome to WanderEU</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
          .serif { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; }
        `}</style>
      </Head>
      <Preview>
        Welcome to WanderEU — your EU student travel adventure starts now
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading className="serif" style={headerTitle}>
              WanderEU
            </Heading>
            <Text style={headerSubtitle}>Budget travel for EU students</Text>
          </Section>

          {/* Body */}
          <Section style={bodySection}>
            <Heading className="serif" style={h2}>
              Welcome, {name}!
            </Heading>
            <Text style={paragraph}>
              You've just unlocked the smartest way for EU students to plan
              budget trips across Europe. From Prague to Porto, Budapest to
              Barcelona — we've got you covered.
            </Text>

            {/* Feature card */}
            <Section style={card}>
              <Text style={cardTitle}>What you can do with WanderEU:</Text>
              <Text style={featureItem}>
                <span style={featureEmoji}>🗺️</span>{" "}
                <strong>AI-powered itineraries</strong> — Full day-by-day plans
                in seconds, tailored to your budget
              </Text>
              <Text style={featureItem}>
                <span style={featureEmoji}>🎓</span>{" "}
                <strong>Student discounts</strong> — Every student deal at your
                destination, surfaced automatically
              </Text>
              <Text style={featureItem}>
                <span style={featureEmoji}>💶</span>{" "}
                <strong>Budget tracking</strong> — Log expenses and see exactly
                where your money goes
              </Text>
              <Text style={featureItem}>
                <span style={featureEmoji}>👥</span>{" "}
                <strong>Group planning</strong> — Invite friends and plan
                together in real time
              </Text>
            </Section>

            {/* Tip */}
            <Section style={tipBox}>
              <Text style={tipText}>
                💡 <strong>Pro tip:</strong> Start with a weekend trip. Enter
                your budget, choose a destination, and let our AI build the full
                itinerary — you can tweak every detail afterwards.
              </Text>
            </Section>

            <Button href={dashboardUrl} style={ctaButton}>
              Plan my first trip →
            </Button>

            <Hr style={divider} />

            <Text style={paragraph}>
              If you have any questions, just reply to this email or chat with
              Wanda, your AI travel assistant, inside the app.
            </Text>
            <Text style={paragraph}>
              Happy travels,
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

export default WelcomeEmail;

// ─── Styles ───────────────────────────────────────────────────────────────────
const body: React.CSSProperties = {
  backgroundColor: "#faf9f7",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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

const headerTitle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: 400,
  letterSpacing: "-0.5px",
  margin: 0,
};

const headerSubtitle: React.CSSProperties = {
  color: "rgba(255,255,255,0.8)",
  fontSize: "13px",
  margin: "4px 0 0",
};

const bodySection: React.CSSProperties = {
  padding: "40px",
};

const h2: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  fontSize: "24px",
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

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  margin: "20px 0",
  border: "1px solid #e8e4df",
};

const cardTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "14px",
  color: "#1a1a1a",
  margin: "0 0 12px",
};

const featureItem: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#444444",
  margin: "0 0 10px",
};

const featureEmoji: React.CSSProperties = {
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
