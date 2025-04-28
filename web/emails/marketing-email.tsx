import {
  Body,
  Button,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import tailwindConfig from "tailwind.config";
import { theme } from "./email-theme";

export default function MarketingEmail() {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          ...tailwindConfig,
          theme: {
            extend: {
              borderRadius: {
                sm: theme.radius.sm,
                md: theme.radius.md,
                lg: theme.radius.lg,
                xl: theme.radius.xl,
              },
              colors: {
                primary: theme.colors.primary,
                secondary: theme.colors.secondary,
                background: theme.colors.background,
                foreground: theme.colors.foreground,
                card: theme.colors.card,
                popover: theme.colors.popover,
                border: theme.colors.border,
                input: theme.colors.input,
                ring: theme.colors.ring,
                muted: theme.colors.muted,
                accent: theme.colors.accent,
                destructive: theme.colors.destructive,
                sidebar: theme.colors.sidebar,
              },
            },
          },
        }}
      >
        <Body
          className="p-4 text-white"
          style={{
            fontFamily: theme.fontFamily.sans,
            backgroundColor: theme.colors.background,
          }}
        >
          <Overview
            overview={[
              "AI Tool Hub is the best place to find AI tools",
              "We have a new tool for you to try out today",
              "Check out our latest blog post on AI trends",
              "Don't forget to check out our sponsors",
              "We have a special offer for you",
              "Join our community on Discord",
            ]}
          />
          <Section className="p-2" />
          <BreakingNews
            summaries={[
              {
                title: "AI Tool Hub is the best place to find AI tools",
                description: "We have a new tool for you to try out today",
              },
              {
                title: "Check out our latest blog post on AI trends",
                description: "Don't forget to check out our sponsors",
              },
              {
                title: "We have a special offer for you",
                description: "Join our community on Discord",
              },
              {
                title: "Follow us on Twitter for the latest updates",
                description: "Check out our YouTube channel for tutorials",
              },
              {
                title: "We have a new podcast episode out",
                description: "Join our newsletter for exclusive content",
              },
            ]}
          />
          <Section className="p-2" />
          <TopTenTools
            tools={[
              {
                name: "AI Tool 1",
                description: "Description of AI Tool 1",
              },
              {
                name: "AI Tool 2",
                description: "Description of AI Tool 2",
              },
              {
                name: "AI Tool 3",
                description: "Description of AI Tool 3",
              },
              {
                name: "AI Tool 4",
                description: "Description of AI Tool 4",
              },
              {
                name: "AI Tool 5",
                description: "Description of AI Tool 5",
              },
            ]}
          />
          <Section className="p-2" />
          <Sponsors
            sponsors={[
              {
                name: "Sponsor 1",
                logo: "https://picsum.photos/200/300",
                url: "https://example.com/sponsor1",
              },
              {
                name: "Sponsor 2",
                logo: "https://picsum.photos/200/300",
                url: "https://example.com/sponsor2",
              },
              {
                name: "Sponsor 3",
                logo: "https://picsum.photos/200/300",
                url: "https://example.com/sponsor3",
              },
            ]}
          />
          <Feedback />
        </Body>
      </Tailwind>
    </Html>
  );
}

function Overview({ overview }: { overview: string[] }) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card p-4">
      <Heading as="h1" className="m-0 text-xl font-semibold">
        Hey AI Enthusiast!
      </Heading>

      <Text className="mb-2 mt-0 text-lg font-semibold text-primary">
        Welcome back to the worlds #1 AI newsletter.
      </Text>

      <Text className="mb-4 mt-0 text-sm text-muted-foreground">
        {`Here's a glimpse of what we have today:`}
      </Text>

      {overview.map((item, index) => (
        <Text key={index} className="my-2 text-sm">
          <span className="text-primary">•</span>
          {` ${item}`}
        </Text>
      ))}

      <Text className="text-md mb-0 mt-4">
        Stop receiving our newsletter{" "}
        <Link className="cursor-pointer text-orange-400">here</Link>
      </Text>
    </Section>
  );
}

function TopTenTools({
  tools,
}: {
  tools: {
    name: string;
    description: string;
  }[];
}) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card p-4">
      <Heading as="h1" className="m-0 mb-4 text-xl font-semibold">
        Top 10 AI Tools of the Day
      </Heading>

      {tools.map((tool, index) => {
        return (
          <Row key={index} className="mt-2">
            <Text className="m-0 font-semibold">{tool.name}</Text>
            <Text className="m-0 text-sm">{tool.description}</Text>
          </Row>
        );
      })}

      <Section className="mt-4 border-t border-solid pt-4 text-center text-sm">
        <Text className="m-0">Have an AI tool that should be featured?</Text>
        <Link className="cursor-pointer text-orange-400">
          Submit your AI tool to the #1 AI tools marketplace
        </Link>
      </Section>
    </Section>
  );
}

function BreakingNews({
  summaries,
}: {
  summaries: {
    title: string;
    description: string;
  }[];
}) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card p-4">
      <Heading as="h1" className="m-0 mb-4 text-xl font-semibold">
        The latest developments in AI
      </Heading>

      {summaries.map((summary, index) => {
        return (
          <Row key={index} className="mt-2">
            <Text className="m-0 font-semibold text-orange-400">
              {summary.title}
            </Text>
            <Text className="m-0 text-sm">{summary.description}</Text>
          </Row>
        );
      })}
    </Section>
  );
}

function Sponsors({
  sponsors,
}: {
  sponsors: { name: string; logo: string; url: string }[];
}) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card p-4">
      <Text className="mb-2 mt-0 text-sm text-muted-foreground">
        {`Today’s Sponsors`}
      </Text>
      <Heading as="h1" className="m-0 mb-4 mt-2 text-xl font-semibold">
        We are grateful for your support
      </Heading>

      {sponsors.map((sponsor) => (
        <Row key={sponsor.name} style={{ marginBottom: "8px" }}>
          <Column
            width={10}
            style={{ verticalAlign: "middle", paddingRight: "8px" }}
          >
            <Link className="cursor-pointer" href={sponsor.url}>
              <Img
                src={sponsor.logo}
                alt={sponsor.name}
                width={32}
                height={32}
                style={{ display: "block", borderRadius: "4px" }}
              />
            </Link>
          </Column>

          {/* name cell */}
          <Column width="auto" style={{ verticalAlign: "middle" }}>
            <span className="text-lg font-semibold">{sponsor.name}</span>
          </Column>
        </Row>
      ))}

      <Button className="text-sm text-orange-400">
        Click here to learn more about becoming a sponsor
      </Button>
    </Section>
  );
}

function Feedback() {
  return (
    <Section className="border border-border p-6 text-center">
      <Text className="my-[8px] text-lg font-semibold leading-[28px] text-primary">
        Your opinion matters
      </Text>
      <Heading
        as="h1"
        className="m-0 mt-[8px] text-xl font-semibold leading-[36px]"
      >
        We want to hear from you
      </Heading>
      <Text className="text-4 leading-[24px] text-primary/60">
        How would you rate todays email on a scale from 1 to 5?
      </Text>
      <Row>
        <Column align="center">
          <table>
            <tr>
              {[1, 2, 3, 4, 5].map((number) => (
                <td align="center" className="p-[4px]" key={number}>
                  <Button
                    style={{ color: theme.colors.primary.DEFAULT }}
                    className="h-5 w-5 rounded-[8px] border border-solid p-[8px] font-semibold"
                    // Replace with the proper URL that saves the selected number
                    href="https://aitoolhub.com/feedback"
                  >
                    {number}
                  </Button>
                </td>
              ))}
            </tr>
          </table>
        </Column>
      </Row>
    </Section>
  );
}
