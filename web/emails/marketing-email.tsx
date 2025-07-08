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

export interface RedditPost {
  title: string;
  image?: string | null;
  permalink: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  thumbnail?: string | null;
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
  redditPosts: RedditPost[];
  id: string;
}

/* contrast safe colors for both modes (gmail and outlook) */
const COLORS = {
  background: "#F1F5F9", /* var(--background): #F1F5F9 */
  foreground: "#1F2937", /* var(--foreground): #374151 */
  primary: "#3B82F6", /* var(--primary): -> linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);*/
  primaryForeground: "#3B82F6", /* var(--primary-foreground): #3B82F6 */
  muted: "#E5E7EB", /* var(--muted): #F1F5F9 */
  mutedForeground: "#6B7280", /* var(--muted-foreground): #4B5563 */ 
  cardBorder: "#CBD5E1" , /* card border from .gradient-card: #B6E0FE */
  cardBackground: "#FFFFFF", /* var(--card): linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 50%, #E0F2FE 100%) */
  cardForeground: "#0F172A", /* var(--card-foreground): #0F172A */
  textGray900: "#1A1A1A", /* text-gray-900 ->  #111827 */
}

// left out any styling that uses gradient
const styles = {
  heading: {
    color: COLORS.primary,
  },
  card: {
    /* gradient-card styling */
    backgroundColor: COLORS.cardBackground,
    border: `1.5px solid ${COLORS.cardBorder}`,
    borderRadius: "12px",
    boxShadow: "0 6px 40px 0 rgba(16, 42, 67, 0.06)",
  },
  twitterCard: {
    /* twitter-card styling */
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: "12px",
    padding: "24px",
    marginTop: "16px",
  },
  twitterAvatar: {
    /* bordering around twitter profile image */
    display: "block",
    borderRadius: "50%",
    border: `5px solid ${COLORS.muted}`
  },
  redditAvatar: {
    display: "block",
    borderRadius: "50%",
  },
  redditCard: {
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: "12px",
    padding: "24px",
    marginTop: "16px",
  },
  redditBubble: {
    background: "rgba(107, 114, 128, 0.1)",
    color: COLORS.textGray900,
    borderRadius: "9999px",
    padding: "4px 12px",
    display: "inline-block",
  },
  feedbackBtn: {
    /* styling for feedback-btn */
    borderRadius: "8px",
    padding: "8px 12px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
    minWidth: "32px",
    background: COLORS.cardBackground,  // linear-gradient(90deg, #E0F2FE 0%, #F0F9FF 100%)
    border: `2px solid ${COLORS.primaryForeground}`,
    color:"#2563EB",
    transition: "box-shadow 0.2s",
  },  
   newsItem: {
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "12px",
  },    
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
  redditPosts,
  id,
}: MarketingEmailProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>
          {`
            :root {
              --background: ${theme.dark.colors.background};
              --foreground: ${theme.dark.colors.foreground};
              --card: ${theme.dark.colors.card.DEFAULT};
              --card-foreground: ${theme.dark.colors.card.foreground};
              --popover: ${theme.dark.colors.popover.DEFAULT};
              --popover-foreground: ${theme.dark.colors.popover.foreground};
              --primary: ${theme.dark.colors.primary.DEFAULT};
              --primary-foreground: ${theme.dark.colors.primary.foreground};
              --secondary: ${theme.dark.colors.secondary.DEFAULT};
              --secondary-foreground: ${theme.dark.colors.secondary.foreground};
              --muted: ${theme.dark.colors.muted.DEFAULT};
              --muted-foreground: ${theme.dark.colors.muted.foreground};
              --accent: ${theme.dark.colors.accent.DEFAULT};
              --accent-foreground: ${theme.dark.colors.accent.foreground};
              --destructive: ${theme.dark.colors.destructive.DEFAULT};
              --destructive-foreground: ${theme.dark.colors.destructive.foreground};
              --border: ${theme.dark.colors.border};
              --input: ${theme.dark.colors.input};
              --ring: ${theme.dark.colors.ring};
              --sidebar-background: ${theme.dark.colors.sidebar.DEFAULT};
              --sidebar-foreground: ${theme.dark.colors.sidebar.foreground};
              --sidebar-primary: ${theme.dark.colors.sidebar.primary};
              --sidebar-primary-foreground: ${theme.dark.colors.sidebar.primaryForeground};
              --sidebar-accent: ${theme.dark.colors.sidebar.accent};
              --sidebar-accent-foreground: ${theme.dark.colors.sidebar.accentForeground};
              --sidebar-border: ${theme.dark.colors.sidebar.border};
              --sidebar-ring: ${theme.dark.colors.sidebar.ring};

              /* Upgraded contrast for dark mode */
              --gradient-orange: linear-gradient(135deg, #FDBA74 0%, #FB923C 100%);
              --gradient-green: linear-gradient(135deg, #6EE7B7 0%, #22D3EE 100%);
              --gradient-purple: linear-gradient(135deg, #A78BFA 0%, #818CF8 100%);
              --gradient-blue: linear-gradient(135deg, #60A5FA 0%, #38BDF8 100%);
            }
            @media (prefers-color-scheme: light) {
              :root {
                --background: #F1F5F9;
                --foreground: #374151;
                --card: linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 50%, #E0F2FE 100%);
                --card-foreground: #0F172A;
                --popover: #FFFFFF;
                --popover-foreground: #0F172A;
                --primary: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);
                --primary-foreground: #3B82F6;
                --secondary: #F8FAFC;
                --secondary-foreground: #1E293B;
                --muted: #F1F5F9;
                --muted-foreground: #4B5563;
                --accent: #E0F2FE;
                --accent-foreground: #0F172A;
                --destructive: #DC2626;
                --destructive-foreground: #FFFFFF;
                --border: #CBD5E1;
                --input: #E2E8F0;
                --ring: #3B82F6;
                --gradient-orange: linear-gradient(135deg, #FB923C 0%, #EA580C 100%);
                --gradient-green: linear-gradient(135deg, #34D399 0%, #059669 100%);
                --gradient-purple: linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%);
                --gradient-blue: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
              }
              .gradient-card {
                background: var(--card);
                border: 1.5px solid #B6E0FE;
                border-radius: 12px;
                box-shadow: 0 8px 32px 0 rgba(16, 42, 67, 0.06);
              }
              .text-gray-700, .text-gray-900 {
                color: var(--foreground) !important;
              }
              .text-gray-600 {
                color: var(--muted-foreground) !important;
              }
              .news-item-hover:hover {
                background: linear-gradient(90deg, #E0F2FE 0%, transparent 100%);
                font-weight: medium;
              }
              .accent-bar-orange {
                background: linear-gradient(135deg, #FBBF24 0%, #FB923C 100%);
              }
              .accent-bar-green {
                background: linear-gradient(135deg, #6EE7B7 0%, #34D399 100%);
              }
              .accent-bar-purple {
                background: linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%);
              }
              .feedback-btn {
                background: linear-gradient(90deg, #E0F2FE 0%, #F0F9FF 100%);
                border: 2px solid #3B82F6;
                color: #2563EB;
                transition: box-shadow 0.2s;
              }
              .feedback-btn:hover {
                box-shadow: 0 2px 8px 0 rgba(59, 130, 246, 0.09);
              }
              .social-icon:hover {
                box-shadow: 0 2px 8px 0 rgba(59, 130, 246, 0.10);
                outline: 1.5px solid #A5B4FC;
              }
            }
            @media (prefers-color-scheme: dark) {
              :root {
                --background: #111827;
                --foreground: #F3F4F6;
                --card: linear-gradient(135deg, #192339 0%, #1E293B 100%);
                --card-foreground: #F3F4F6;
                --popover: #1E2537;
                --popover-foreground: #F3F4F6;
                --primary: linear-gradient(90deg, #60A5FA 0%, #A78BFA 100%);
                --primary-foreground: #111827;
                --secondary: #1E293B;
                --secondary-foreground: #F3F4F6;
                --muted: #27324a;
                --muted-foreground: #A1A1AA;
                --accent: #334155;
                --accent-foreground: #F3F4F6;
                --destructive: #F87171;
                --destructive-foreground: #F3F4F6;
                --border: #334155;
                --input: #1E293B;
                --ring: #60A5FA;
              }
              body {
                background-color: #111827 !important;
                color: #F3F4F6 !important;
              }
              .foreground {
                color: var(--foreground) !important;
              }
              .muted-foreground {
                color: var(--muted-foreground) !important;
              }
              .gradient-card {
                background: var(--card) !important;
                border: 1.5px solid #334155 !important;
                border-radius: 14px !important;
                box-shadow: 0 6px 40px 0 rgba(16, 42, 67, 0.28) !important;
                /* Add backdrop filter for extra "glass" effect if supported */
                backdrop-filter: blur(2px) !important;
              }
              .gradient-title {
                background: linear-gradient(90deg, #60A5FA 0%, #A78BFA 100%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                font-weight: 700;
                text-shadow: 0 2px 10px rgba(60,120,240,0.15);
              }
              .news-item-hover {
                transition: all 0.2s ease;
                border-radius: 8px;
                padding: 8px;
              }
              .news-item-hover:hover {
              font-weight: medium;  
              background: linear-gradient(90deg, #233860 0%, transparent 100%) !important;
              }
              .accent-bar-orange {
                background: var(--gradient-orange);
              }
              .accent-bar-green {
                background: var(--gradient-green);
              }
              .accent-bar-purple {
                background: var(--gradient-purple);
              }
              .twitter-card, .reddit-card {
                background: linear-gradient(120deg, #192339 60%, #222d43 100%) !important;
                border: 1px solid #28375b !important;
                border-radius: 12px !important;
                padding: 24px !important;
                margin-top: 16px !important;
              }
              .twitter-avatar {
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #334155;
              }
              .reddit-avatar {
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .reddit-bubble {
                background: var(--muted-foreground) !important,
                color: var(--foreground) !important,
                borderRadius: "9999px",
                padding: "4px 12px",
                display: "inline-block",
              }
              .text-gray-900, .text-gray-700 {
                color: var(--foreground) !important;
              }
              .text-gray-600 {
                color: var(--muted-foreground) !important;
              }
              .feedback-btn {
                background: linear-gradient(90deg, #233860 0%, #3B82F6 100%) !important;
                border: 2px solid #60A5FA !important;
                color: #F3F4F6 !important;
                transition: box-shadow 0.2s !important;
              }
              .feedback-btn:hover {
                box-shadow: 0 2px 12px 0 rgba(59, 130, 246, 0.17);
              }
              .social-icon:hover {
                box-shadow: 0 2px 8px 0 rgba(96, 165, 250, 0.13);
                outline: 1.5px solid #A78BFA;
              }
            }
            /* All mode defaults for styling */
            .gradient-card {
              background: var(--card);
              border: 1px solid var(--border);
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.10);
            }
            .gradient-title {
                background: var(--primary);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                font-weight: 700;
                text-shadow: 0 2px 10px rgba(60,120,240,0.15);
            }
            .news-item-hover {
              transition: all 0.2s ease;
              border-radius: 8px;
              padding: 8px;
            }
            .news-item-hover:hover {
              font-weight: medium;  
              background: linear-gradient(90deg,  #E0F2FE 0%, transparent 100%);
            }
            .accent-bar-orange {
              width: 4px;
              height: 24px;
              background: var(--gradient-orange);
              border-radius: 2px;
              margin-right: 12px;
            }
            .accent-bar-green {
              width: 4px;
              height: 24px;
              background: var(--gradient-green);
              border-radius: 2px;
              margin-right: 12px;
            }
            .accent-bar-purple {
              width: 4px;
              height: 24px;
              background: var(--gradient-purple);
              border-radius: 2px;
              margin-right: 12px;
            }
            .twitter-card, .reddit-card {
              background: var(--card);
              border: 1px solid var(--border);
              border-radius: 12px;
              padding: 24px;
              margin-top: 16px;
            }
            .twitter-avatar {
              background: var(--muted);
              border-radius: 50%;
              width: 48px;
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          `}
        </style>

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
                primary: "var(--primary)",
                secondary: "var(--secondary)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: {
                  DEFAULT: "var(--card)",
                  foreground: "var(--card-foreground)",
                },
                popover: {
                  DEFAULT: "var(--popover)",
                  foreground: "var(--popover-foreground)",
                },
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                muted: {
                  DEFAULT: "var(--muted)",
                  foreground: "var(--muted-foreground)",
                },
                accent: {
                  DEFAULT: "var(--accent)",
                  foreground: "var(--accent-foreground)",
                },
                destructive: {
                  DEFAULT: "var(--destructive)",
                  foreground: "var(--destructive-foreground)",
                },
              },
            },
          },
        }}
      >
        <Body
          className="px-6 py-8 text-foreground"
          style={{
            fontFamily: theme.fontFamily.sans,
            color: COLORS.foreground,
            background: COLORS.background,
          }}
        >
          <Section className="mx-auto max-w-2xl">
            <Title baseUrl={baseUrl} />
            <Overview overview={overview} baseUrl={baseUrl} />
            <Section className="p-4" />
            {sponsors.length > 0 && (
              <>
                <Sponsors sponsors={sponsors} baseUrl={baseUrl} />
                <Section className="p-4" />
              </>
            )}
            <BreakingNews summaries={breakingNews} />
            <Section className="p-4" />
            <TrendingTwitterNews tweets={tweets} />
            <Section className="p-4" />

            {tools.length > 0 && (
              <>
                <TopTenTools tools={tools} baseUrl={baseUrl} />
                <Section className="p-4" />
              </>
            )}

            <TrendingRedditPosts posts={redditPosts} />
            <Section className="p-4" />

            <Feedback baseUrl={baseUrl} id={id} />
            <Section className="p-4" />
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
    <Section className="py-16 text-center">
      <Link
        href={baseUrl}
        className="gradient-title m-0 cursor-pointer text-4xl font-bold"
        style = {styles.heading}
      >
        {"Aitoolhub.co"}
      </Link>
    </Section>
  );
}

function TrendingTwitterNews({ tweets }: { tweets: Tweet[] }) {
  return (
    <Section 
      className="gradient-card p-8"
      style={styles.card}
    >
      <Heading
        as="h1"
        className="gradient-title m-0 mb-6 text-2xl font-bold"
        style={styles.heading}
      >
        {"Trending on Twitter"}
      </Heading>

      {tweets.map((tweet, idx) => (
        <Section 
          key={idx} 
          className="twitter-card"
          style={styles.twitterCard}
          >
          <Row>
            <Column
              width={60}
              style={{ verticalAlign: "top", paddingRight: "12px" }}
            >
              <Link className="cursor-pointer" href={tweet.url}>
                <div 
                className="twitter-avatar"
                >
                  <Img
                    src={tweet.profilePicture}
                    alt={tweet.author}
                    width={32}
                    height={32}
                    style={styles.twitterAvatar}
                  />
                </div>
              </Link>
            </Column>
            <Column>
              <Link
                href={tweet.url}
                className="m-0 text-foreground"
                style={{ textDecoration: "none" }}
              >
                <Text className="m-0 mb-1">
                  <span className="foreground text-lg font-semibold" style={{color: COLORS.textGray900}}>{tweet.author}</span>{" "}
                  <span className="text-lg" style={{ color: COLORS.mutedForeground }}>{tweet.handle}</span>
                </Text>
              </Link>
              <Text className="foreground m-0 mt-2 text-base" style={{ color: COLORS.foreground }}>
                <Link className="foreground text-foreground" href={tweet.url} style={{ textDecoration: "none", color: COLORS.foreground }}>
                    <div className="foreground" style={{ color: COLORS.foreground }}>
                      <Markdown
                      markdownCustomStyles={{
                        p: {
                          marginTop: "0px",
                          fontSize: "17px",
                        },
                      }}
                    
                      >
                        {tweet.content}
                      </Markdown>
                    </div>
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
                    marginTop: "12px",
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

function TrendingRedditPosts({ posts } : {posts: RedditPost[]}) {

  const redditMascotUrls = [
    "https://www.redditstatic.com/avatars/avatar_default_02_24A0ED.png",
    "https://www.redditstatic.com/avatars/avatar_default_04_46A508.png",
    "https://www.redditstatic.com/avatars/avatar_default_06_24A0ED.png",
    "https://www.redditstatic.com/avatars/avatar_default_08_46A508.png",
  ]
  return (
    <Section 
      className="gradient-card p-8"
      style={styles.card}
    >

      <Heading
        as="h1"
        className="gradient-title m-0 mb-6 text-2xl font-bold"
        style={styles.heading}
      >
        {"Relevant Reddit Posts"}
      </Heading>

      {posts.map((post, index) => {
        const mascotUrl = redditMascotUrls[index % redditMascotUrls.length];

        return (
          <Section
            key={index}
            className="reddit-card"
            style={styles.redditCard}
          >
            <Row>
              {/* Post Subreddit and Username and Content */}
              <Column>
                <Link
                  href={post.permalink}
                  className="m-0"
                  style={{ 
                    textDecoration: "none"
                  }}
                >

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Img
                      src={mascotUrl}
                      alt={post.author}
                      width={35}
                      height={35}
                      style={styles.redditAvatar}
                    />

                    <div style={{ marginLeft: "5px"}}>
                      <Text className="foreground m-0 ml-2 text-xs font-semibold" style={{ color: COLORS.textGray900, display: "block", margin: 0 }}>
                        r/{post.subreddit}
                      </Text>
                      <Text className="muted-foreground m-0 ml-2 text-xs" style={{ color: COLORS.mutedForeground, display: "block", margin: 0 }}>
                        Posted by u/{post.author}
                      </Text>

                    </div>

                  </div>
  
                  <Text className="foreground m-0 pt-5 font-bold text-base" style={{ color: COLORS.foreground, lineHeight: "1.25", paddingTop: "5px" }}>
                    {post.title}
                  </Text>

                  {/* IF thumbnail exists */}
                  {post.image && (
                    <Img
                      src={post.image}
                      alt="Reddit post thumbnail image"
                      style={{
                        width: "100%",
                        display: "block",
                        borderRadius: "8px",
                        marginTop: "12px",
                        marginBottom: "8px",
                      }}
                      />
                  )}

                  {/* Comments and Upvotes */}

                  <div 
                    className="reddit-bubble mt-2"
                    style={styles.redditBubble}
                  >
                    <Text className="m-0 mb-1">
                      <span className="foreground text-xs" style={{color: COLORS.textGray900}}>{post.score} upvotes</span>
                    </Text>
                  </div>


                  <div 
                    className="reddit-bubble mt-2"
                    style={styles.redditBubble}
                  >
                    <Text className="m-0 mb-1">
                      <span className="foreground text-xs" style={{color: COLORS.textGray900}}>{post.numComments} comments</span>
                    </Text>
                  </div>
                </Link>
              </Column>
            </Row>

          </Section>

        )
      })}

    </Section>
  )

}

function Overview({
  overview,
  baseUrl,
}: {
  overview: string[];
  baseUrl: string;
}) {
  return (
    <Section 
      className="gradient-card p-8"
      style={styles.card}
      >
      <Heading
        as="h1"
        className="gradient-title m-0 text-2xl font-bold"
        style={styles.heading}
      >
        Welcome! What is happening in AI right now?
      </Heading>

      <Text className="muted-foreground mb-6 mt-4 text-base" style={{ color: COLORS.mutedForeground }}>
        {"Here's a glimpse of what we have today:"}
      </Text>

      {overview.map((item, index) => (
        <div 
          key={index} 
          className="news-item-hover" 
          style={ styles.newsItem }>
          <Text className="foreground m-0 text-base" style={{ display: "flex", alignItems: "flex-start", color:COLORS.foreground}}>
            <span style={{ color: COLORS.primaryForeground, marginRight: "8px", fontSize: "16px" }}>•</span>
            <span>{item}</span>
          </Text>
        </div>
      ))}

      <Text className="muted-foreground mb-0 mt-6" style={{ color: COLORS.mutedForeground }}>
        Stop receiving our newsletter{" "}
        <Link
          href={baseUrl + "/unsubscribe"}
          className="cursor-pointer"
          style={{
            color: COLORS.primary,
            textDecoration: "none",
            fontWeight: "500"
          }}
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
    <Section 
      className="gradient-card p-8"
      style={styles.card}
    >
      <Heading
        as="h1"
        className="gradient-title m-0 mb-6 text-2xl font-bold"
        style={styles.heading}
      >
        Top 10 AI Tools of the Day
      </Heading>

      {tools.map((tool, index) => {
        return (
          <Row key={index} style={{ marginBottom: "16px" }}>
            <Text className="foreground m-0 mb-1 font-semibold" style={{color: COLORS.textGray900}}>{tool.name}</Text>
            <Text className="muted-foreground m-0 text-base" style={{color: COLORS.mutedForeground}}>{tool.description}</Text>
          </Row>
        );
      })}

      <Section className="mt-6 border-t border-solid pt-6 text-center" style={{ borderColor: COLORS.cardBorder}}>
        <Text className="muted-foreground m-0 mb-2" style={{ color: COLORS.mutedForeground }}>Have an AI tool that should be featured?</Text>
        <Link
          href={baseUrl + "/contact-us"}
          className="cursor-pointer"
          style={{
            color: COLORS.primary,
            textDecoration: "none",
            fontWeight: "500"
          }}
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
  const accentColors = ["Orange", "Green", "Purple"];
  const accentTextColors = [
    "linear-gradient(90deg, #fb923c 0%, #ea580c 100%)",
    "linear-gradient(90deg, #34d399 0%, #22d3ee 100%)",
    "linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)"
  ];
  const accentSolidTextColors = [
    "#f97316", 
    "#2dd4bf", 
    "#8b5cf6"
  ]

  return (
    <Section 
      className="gradient-card p-8"
      style={styles.card}
    >
      <Heading
        as="h1"
        className="gradient-title m-0 mb-6 text-2xl font-bold"
        style={styles.heading}
      >
        The latest developments in AI
      </Heading>

      {summaries.map((summary, index) => {
        const colorClass = accentColors[index % accentColors.length];
        const accentBarClass = `accent-bar-${colorClass}`;
        const accentTitleStyle = {
          color: accentSolidTextColors[index % accentSolidTextColors.length],
        };
        return (
          <Row key={index} style={{ marginBottom: "24px" }}>
            <Column>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                <div 
                  className={accentBarClass} 
                  style={{
                    background: accentSolidTextColors[index % accentSolidTextColors.length],
                    width: "4px",
                    height: "24px",
                    borderRadius: "2px",
                    marginRight: "12px",
                  }}>
                    
                  </div>
                <Link
                  href={summary.url}
                  className="m-0 text-lg font-semibold"
                  style={accentTitleStyle}
                >
                  {summary.title}
                </Link>
              </div>
              <Text className="foreground m-0 ml-4 text-base" style={{ color: COLORS.foreground }}>
                {summary.description}
              </Text>
            </Column>
          </Row>
        );
      })}

      <Row style={{ marginTop: "24px" }}>
        <Link
          href="#"
          className="cursor-pointer"
          style={{
            display: "flex",
            alignItems: "center",
            color: COLORS.primary, 
            textDecoration: "none",
            fontWeight: "500"
          }}
        >
          Read more →
        </Link>
      </Row>
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
    <Section 
      className="gradient-card p-8"
      style={styles.card}
    >
      <Text className="muted-foreground mb-2 mt-0 text-base" style={{ color: COLORS.mutedForeground }}>
        {"Today's Sponsors"}
      </Text>
      <Heading
        as="h1"
        className="gradient-title m-0 mb-6 mt-2 text-2xl font-bold"
        style={styles.heading}
      >
        We are grateful for your support
      </Heading>

      {sponsors.map((sponsor) => (
        <Row key={sponsor.name} style={{ marginBottom: "12px" }}>
          <Column
            width={50}
            style={{ verticalAlign: "middle", paddingRight: "12px" }}
          >
            <Link className="cursor-pointer" href={sponsor.url}>
              <Img
                src={sponsor.logo}
                alt={sponsor.name}
                width={32}
                height={32}
                style={{ display: "block", borderRadius: "6px" }}
              />
            </Link>
          </Column>

          <Column width="auto" style={{ verticalAlign: "middle" }}>
            <Link
              className="foreground cursor-pointer"
              href={sponsor.url}
              style={{
                color: COLORS.foreground,
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "18px"
              }}
            >
              {sponsor.name}
            </Link>
          </Column>
        </Row>
      ))}

      <Text className="mt-6">
        <Link
          href={baseUrl + "/contact-us"}
          className="cursor-pointer"
          style={{
            color: COLORS.primary,
            textDecoration: "none",
            fontWeight: "500"
          }}
        >
          Click here to learn more about becoming a sponsor
        </Link>
      </Text>
    </Section>
  );
}

function Feedback({ id, baseUrl }: { id: string; baseUrl: string }) {
  return (
    <Section
      className="gradient-card p-8 text-center"
      style={styles.card}
    >
      <Text
        className="gradient-title my-2 text-xl font-bold leading-7"
        style={styles.heading}
      >
        Your opinion matters
      </Text>
      <Heading
        as="h1"
        className="foreground m-0 mt-2 text-2xl font-bold leading-9"
        style={{ color: COLORS.foreground }}
      >
        We want to hear from you
      </Heading>
      <Text className="muted-foreground text-base leading-6" style={{ color: COLORS.mutedForeground }}>
        How would you rate today's email on a scale from 1 to 5?
      </Text>
      <Row>
        <Column align="center">
          <table>
            <tr>
              {[1, 2, 3, 4, 5].map((number) => (
                <td align="center" className="p-1" key={number}>
                  <Button
                    className="feedback-btn text-center"
                    style={styles.feedbackBtn}
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
            {links.map((link) => (
              <td align="center" key={link.url} className="px-2">
                <Link href={link.url} className="cursor-pointer">
                  <Img
                    src={link.image}
                    alt={link.alt}
                    width={36}
                    height={36}
                    className="social-icon"
                    style={{
                      display: "block",
                      borderRadius: "8px",
                      transition: "transform 0.2s ease"
                    }}
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
