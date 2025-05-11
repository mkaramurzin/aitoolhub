import {
  Body,
  Button,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Markdown,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import tailwindConfig from "tailwind.config";
import { theme } from "./email-theme";

interface Tweet {
  profilePicture: string;
  author: string;
  handle: string;
  content: string;
  url: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  image?: string;
}

export interface MarketingEmailProps {
  title: string;
  previewText: string;
  subject: string;
  overview: string[];
  baseUrl: string;
  breakingNews: { title: string; description: string; url: string }[];
  tools: { name: string; description: string }[];
  sponsors: { name: string; logo: string; url: string }[];
  tweets: Tweet[];
  id: string;
}

export default function MarketingEmail({
  title,
  previewText,
  subject,
  baseUrl,
  overview,
  breakingNews,
  tools,
  sponsors,
  tweets,
  id,
}: MarketingEmailProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Preview>{previewText}</Preview>
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
            fontFamily: theme.fontFamily.arial,
            backgroundColor: theme.colors.background,
          }}
        >
          <Section className="mx-auto max-w-2xl">
            <Title baseUrl={baseUrl} />
            <Overview overview={overview} baseUrl={baseUrl} />
            <Section className="p-2" />
            {sponsors.length > 0 && (
              <>
                <Sponsors sponsors={sponsors} baseUrl={baseUrl} />
                <Section className="p-2" />
              </>
            )}
            <BreakingNews summaries={breakingNews} />
            <Section className="p-2" />
            <TrendingTwitterNews tweets={tweets} />
            <Section className="p-2" />

            {tools.length > 0 && (
              <>
                <Section className="mt-4 border-t border-solid pt-4 text-center text-sm" />
                <Section className="p-2" />
                <TopTenTools tools={tools} baseUrl={baseUrl} />
              </>
            )}
            <Feedback baseUrl={baseUrl} id={id} />
            <Section className="p-2" />
            <SocialMediaLink
              links={[
                {
                  url: "https://www.instagram.com/aitoolhub.co",
                  image:
                    "https://aitoolhub.s3.us-west-2.amazonaws.com/insta.png",
                  alt: "Instagram",
                },
                {
                  url: "https://x.com/AiTool35148",
                  image: "https://aitoolhub.s3.us-west-2.amazonaws.com/x.png",
                  alt: "X",
                },
                {
                  url: "https://www.linkedin.com/company/aitoolhub-co/",
                  image:
                    "https://aitoolhub.s3.us-west-2.amazonaws.com/linkin.png",
                  alt: "LinkedIn",
                },
                {
                  url: "https://www.tiktok.com/@aitoolhub.co",
                  image: "https://aitoolhub.s3.us-west-2.amazonaws.com/tt.png",
                  alt: "TikTok",
                },
                {
                  url: "https://discord.gg/mXzpCqQ5MM",
                  image:
                    "https://aitoolhub.s3.us-west-2.amazonaws.com/discord.png",
                  alt: "Discord",
                },
              ]}
            />
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}

function Title({ baseUrl }: { baseUrl: string }) {
  return (
    <Section className="rounded-lg py-14 text-center">
      <Link
        href={baseUrl}
        className="m-0 cursor-pointer text-4xl font-semibold text-white"
      >
        {"Aitoolhub.co"}
      </Link>
    </Section>
  );
}

function TrendingTwitterNews({ tweets }: { tweets: Tweet[] }) {
  return (
    <Section className="">
      {/* Title */}
      <Section className="">
        <Heading as="h1" className="m-0 mb-0 text-2xl font-semibold">
          {"Trending on Twitter"}
        </Heading>
      </Section>
      {tweets.map((tweet, idx) => (
        <Section
          key={idx}
          className="mt-4 rounded-lg border border-solid border-border bg-card p-4"
        >
          <Row className="">
            <Column
              width={40}
              style={{ verticalAlign: "top", paddingTop: "4px" }}
            >
              <Link className="cursor-pointer" href={tweet.url}>
                <Img
                  src={tweet.profilePicture}
                  alt={tweet.author}
                  width={32}
                  height={32}
                  style={{
                    display: "block",
                    borderRadius: "99px",
                  }}
                />
              </Link>
            </Column>
            <Column>
              <Link href={tweet.url} className="m-0 text-white">
                <span className="text-lg">{tweet.author}</span>{" "}
                <span className="text-lg text-muted-foreground">
                  @{tweet.handle}
                </span>
              </Link>
              <Text className="m-0 mt-1 text-base">
                <Link className="text-white" href={tweet.url}>
                  <Markdown
                    markdownCustomStyles={{
                      p: {
                        marginTop: "0px",
                        fontSize: "17px",
                      },
                    }}
                    children={tweet.content}
                  />
                </Link>
              </Text>
              {tweet.image && (
                <Img
                  src={tweet.image}
                  alt="Tweet image"
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: "8px",
                    marginTop: "8px",
                    marginBottom: "8px",
                  }}
                />
              )}
            </Column>
          </Row>
        </Section>
      ))}
    </Section>
  );
}

function Overview({
  overview,
  baseUrl,
}: {
  overview: string[];
  baseUrl: string;
}) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card p-4">
      <Heading as="h1" className="m-0 text-2xl font-semibold">
        Hey AI Enthusiast!
      </Heading>

      <Text className="mb-2 mt-0 text-xl font-semibold text-primary">
        Welcome back! What is happening in AI right now?
      </Text>

      <Text className="mb-4 mt-0 text-base text-muted-foreground">
        {"Here's a glimpse of what we have today:"}
      </Text>

      {overview.map((item, index) => (
        <Text key={index} className="my-2 text-base">
          <span className="text-primary">•</span>
          {` ${item}`}
        </Text>
      ))}

      <Text className="mb-0 mt-4 text-lg">
        Stop receiving our newsletter{" "}
        <Link
          href={baseUrl + "/unsubscribe"}
          className="cursor-pointer text-orange-400"
        >
          here
        </Link>
      </Text>
    </Section>
  );
}

function TopTenTools({
  tools,
  baseUrl,
}: {
  tools: { name: string; description: string }[];
  baseUrl: string;
}) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card p-4">
      <Heading as="h1" className="m-0 mb-4 text-2xl font-semibold">
        Top 10 AI Tools of the Day
      </Heading>

      {tools.map((tool, index) => {
        return (
          <Row key={index} className="mt-2">
            <Text className="m-0 font-semibold">{tool.name}</Text>
            <Text className="m-0 text-base">{tool.description}</Text>
          </Row>
        );
      })}

      <Section className="mt-4 border-t border-solid pt-4 text-center text-sm">
        <Text className="m-0">Have an AI tool that should be featured?</Text>
        <Link
          href={baseUrl + "/contact-us"}
          className="cursor-pointer text-orange-400"
        >
          Submit your AI tool to the #1 AI tools marketplace
        </Link>
      </Section>
    </Section>
  );
}

function BreakingNews({
  summaries,
}: {
  summaries: { title: string; description: string; url: string }[];
}) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card p-4">
      <Heading as="h1" className="m-0 mb-4 text-2xl font-semibold">
        The latest developments in AI
      </Heading>

      {summaries.map((summary, index) => {
        return (
          <Row key={index} className="mt-2">
            <Link
              href={summary.url}
              className="m-0 text-base font-semibold text-orange-400"
            >
              {summary.title}
            </Link>
            <Text className="m-0 text-base">{summary.description}</Text>
          </Row>
        );
      })}
    </Section>
  );
}

function Sponsors({
  sponsors,
  baseUrl,
}: {
  sponsors: { name: string; logo: string; url: string }[];
  baseUrl: string;
}) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card p-4">
      <Text className="mb-2 mt-0 text-base text-muted-foreground">
        {"Today’s Sponsors"}
      </Text>
      <Heading as="h1" className="m-0 mb-4 mt-2 text-2xl font-semibold">
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
            <Link
              className="cursor-pointer text-white underline underline-offset-1"
              href={sponsor.url}
            >
              <span className="text-lg font-semibold">{sponsor.name}</span>
            </Link>
          </Column>
        </Row>
      ))}

      <Link
        href={baseUrl + "/contact-us"}
        className="cursor-pointer text-orange-400"
      >
        Click here to learn more about becoming a sponsor
      </Link>
    </Section>
  );
}

function Feedback({ id, baseUrl }: { id: string; baseUrl: string }) {
  return (
    <Section className="border border-border p-6 text-center">
      <Text className="my-[8px] text-xl font-semibold leading-[28px] text-primary">
        Your opinion matters
      </Text>
      <Heading
        as="h1"
        className="m-0 mt-[8px] text-2xl font-semibold leading-[36px]"
      >
        We want to hear from you
      </Heading>
      <Text className="text-5 leading-[24px] text-primary/60">
        How would you rate todays email on a scale from 1 to 5?
      </Text>
      <Row>
        <Column align="center">
          <table>
            <tr>
              {[1, 2, 3, 4, 5].map((number) => (
                <td align="center" className="p-[4px]" key={number}>
                  <Button
                    style={{
                      color: theme.colors.primary.DEFAULT,
                    }}
                    className="h-5 w-5 rounded-[8px] border border-solid p-[8px] font-semibold"
                    // Replace with the proper URL that saves the selected number
                    href={`${baseUrl}/feedback/${id}?rating=${number}`}
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

function SocialMediaLink({
  links,
}: {
  links: {
    url: string;
    image: string;
    alt: string;
  }[];
}) {
  return (
    <Row>
      <Column align="center">
        <table>
          <tr>
            {links.map((link, index) => (
              <td align="center" key={link.url} className="px-1">
                <Link href={link.url} className="w-8 cursor-pointer">
                  <Img
                    src={link.image}
                    alt={link.alt}
                    width={32}
                    height={32}
                    style={{ display: "block", borderRadius: "8px" }}
                  />
                </Link>
              </td>
            ))}
          </tr>
        </table>
      </Column>
    </Row>
  );
}
