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

interface BudgetAlertEmailProps {
  name: string;
  tripTitle: string;
  destination: string;
  budgetTotal: number;
  actualSpent: number;
  percentUsed: number;
  tripUrl: string;
  categoryBreakdown?: {
    transport: number;
    accommodation: number;
    food: number;
    activity: number;
    shopping: number;
    other: number;
  };
}

export const BudgetAlertEmail = ({
  name = "Explorer",
  tripTitle = "My European Adventure",
  destination = "Prague",
  budgetTotal = 400,
  actualSpent = 340,
  percentUsed = 85,
  tripUrl = "https://wandereu.app/trips/example/expenses",
  categoryBreakdown,
}: BudgetAlertEmailProps) => {
  const remaining = budgetTotal - actualSpent;
  const isOverBudget = remaining < 0;
  const isCritical = percentUsed >= 90 && !isOverBudget;

  const statusColor = isOverBudget
    ? "#dc2626"
    : isCritical
    ? "#d97706"
    : "#16a34a";

  const statusEmoji = isOverBudget ? "🚨" : isCritical ? "⚠️" : "📊";

  const budgetSavingTips = [
    "Cook one meal a day — buy ingredients from a local supermarket",
    "Use public transport day passes instead of single tickets",
    "Look for free walking tours (tip what you can)",
    "Visit museums on their free entry days",
    "Grab lunch at student canteens (menzy) — often under €3",
    "Check if your hostel offers a free or cheap breakfast",
  ];

  return (
    <Html lang="en">
      <Head>
        <title>
          {isOverBudget
            ? "You've exceeded your budget"
            : `Budget alert: ${percentUsed}% used`}
        </title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        `}</style>
      </Head>
      <Preview>
        {isOverBudget
          ? `Over budget by €${Math.abs(remaining).toFixed(0)} on your ${destination} trip`
          : `You've used ${percentUsed}% of your ${destination} budget — €${remaining.toFixed(0)} left`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section
            style={{
              ...header,
              backgroundColor: isOverBudget ? "#991b1b" : "#c84b31",
            }}
          >
            <Text style={headerEyebrow}>
              {statusEmoji} Budget {isOverBudget ? "exceeded" : "alert"}
            </Text>
            <Heading style={headerTitle}>
              {isOverBudget
                ? "Over Budget"
                : isCritical
                ? "Almost There!"
                : `${percentUsed}% Used`}
            </Heading>
            <Text style={headerSubtitle}>{tripTitle} · {destination}</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h2}>Hi {name},</Heading>
            <Text style={paragraph}>
              {isOverBudget
                ? `Your spending on <strong>${tripTitle}</strong> has exceeded the planned budget. Here's where things stand:`
                : `You've used <strong>${percentUsed}%</strong> of your budget for <strong>${tripTitle}</strong>. Here's your current spending:${
                    isCritical
                      ? " Time to be a bit more careful!"
                      : " You're doing well!"
                  }`}
            </Text>

            {/* Budget stats */}
            <Section style={statsCard}>
              <Section style={statRow}>
                <Section style={statItem}>
                  <Text style={statValue}>€{actualSpent.toFixed(0)}</Text>
                  <Text style={statLabel}>Spent</Text>
                </Section>
                <Section style={statItem}>
                  <Text style={statValue}>€{budgetTotal}</Text>
                  <Text style={statLabel}>Budget</Text>
                </Section>
                <Section style={statItem}>
                  <Text
                    style={{ ...statValue, color: isOverBudget ? "#dc2626" : "#16a34a" }}
                  >
                    {isOverBudget ? "-" : ""}€{Math.abs(remaining).toFixed(0)}
                  </Text>
                  <Text style={statLabel}>
                    {isOverBudget ? "Over" : "Left"}
                  </Text>
                </Section>
              </Section>

              {/* Progress bar */}
              <Section style={progressContainer}>
                <Section
                  style={{
                    ...progressBar,
                    width: `${Math.min(percentUsed, 100)}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </Section>
              <Text style={progressLabel}>
                {percentUsed}% of budget used
              </Text>
            </Section>

            {/* Category breakdown */}
            {categoryBreakdown && (
              <>
                <Text style={sectionTitle}>Spending by Category</Text>
                <Section style={card}>
                  {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                    if (amount === 0) return null;
                    const emojis: Record<string, string> = {
                      transport: "🚂",
                      accommodation: "🏨",
                      food: "🍽️",
                      activity: "🎭",
                      shopping: "🛍️",
                      other: "💰",
                    };
                    return (
                      <Section key={cat} style={categoryRow}>
                        <Text style={categoryLabel}>
                          {emojis[cat] ?? "💳"}{" "}
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Text>
                        <Text style={categoryAmount}>€{amount.toFixed(0)}</Text>
                      </Section>
                    );
                  })}
                </Section>
              </>
            )}

            {/* Tips */}
            <Text style={sectionTitle}>
              {isOverBudget ? "Budget Recovery Tips" : "Stay on Track"}
            </Text>
            <Section style={card}>
              {budgetSavingTips.slice(0, 4).map((tip, i) => (
                <Text key={i} style={tipItem}>
                  💡 {tip}
                </Text>
              ))}
            </Section>

            <Button href={tripUrl} style={ctaButton}>
              View expense tracker →
            </Button>

            <Hr style={divider} />

            <Text style={paragraph}>
              You've got this!
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

export default BudgetAlertEmail;

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
  fontSize: "13px",
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
  margin: "0 0 20px",
  border: "1px solid #e8e4df",
};

const statRow: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "16px",
};

const statItem: React.CSSProperties = {
  display: "inline-block",
  textAlign: "center",
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

const progressContainer: React.CSSProperties = {
  backgroundColor: "#e8e4df",
  borderRadius: "4px",
  height: "8px",
  width: "100%",
  overflow: "hidden",
  margin: "0 0 8px",
};

const progressBar: React.CSSProperties = {
  height: "8px",
  borderRadius: "4px",
  backgroundColor: "#c84b31",
};

const progressLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#888888",
  textAlign: "center",
  margin: 0,
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

const categoryRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  margin: "0 0 8px",
};

const categoryLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#444444",
  margin: 0,
};

const categoryAmount: React.CSSProperties = {
  fontSize: "14px",
  color: "#1a1a1a",
  margin: 0,
};

const tipItem: React.CSSProperties = {
  fontSize: "13px",
  color: "#555555",
  margin: "0 0 8px",
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
