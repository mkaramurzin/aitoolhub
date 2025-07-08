import MarketingEmail, { MarketingEmailProps } from "./marketing-email";
const exampleProps: MarketingEmailProps = {
  id: "example-email",
  title: "AI Insights Newsletter",
  previewText: "Latest trends and updates in AI",
  subject: "Your Daily Dose of AI Innovations",
  overview: [
    "Breakthrough research in deep learning.",
    "Expert opinions on AI ethics.",
  ],
  breakingNews: [
    {
      title: "New AI Model Released",
      description:
        "A new cutting-edge AI model has been released, offering faster processing.",
      url: "https://example.com/news1",
    },
    {
      title: "Tech Giant Invests in AI",
      description:
        "A major tech company has announced a significant investment in AI technologies.",
      url: "https://example.com/news1",
    },
  ],
  tools: [
    {
      name: "AI Analyzer",
      description: "Analyze and visualize AI data effectively.",
    },
    {
      name: "NeuralOptimizer",
      description: "Optimize neural network performance quickly.",
    },
  ],
  sponsors: [
    {
      name: "TechCorp",
      logo: "https://picsum.photos/200",
      url: "https://picsum.photos/200",
    },
    {
      name: "InnovateX",
      logo: "https://picsum.photos/200",
      url: "https://picsum.photos/200",
    },
  ],
  tweets: [
    {
      profilePicture: "https://picsum.photos/200",
      author: "Jane Doe",
      handle: "@janedoe",
      content: "Excited about the future of AI!",
      url: "https://twitter.com/janedoe",
      retweetCount: 10,
      replyCount: 2,
      likeCount: 50,
      image: "https://picsum.photos/200",
    },
    {
      profilePicture: "https://picsum.photos/200",
      author: "John Smith",
      handle: "@johnsmith",
      content: "Loving the insights from the AI newsletter.",
      url: "https://twitter.com/johnsmith",
      retweetCount: 5,
      replyCount: 1,
      likeCount: 40,
    },
    {
      profilePicture: "https://picsum.photos/200",
      author: "Alice Martin",
      handle: "@alicemartin",
      content:
        "AI is revolutionizing everything! #innovationAI is revolutionizing everything! #innovationAI is revolutionizing everything! #innovationAI is revolutionizing everything! #innovation",
      url: "https://twitter.com/alicemartin",
      retweetCount: 15,
      replyCount: 3,
      likeCount: 80,
    },
    {
      profilePicture: "https://picsum.photos/200",
      author: "Bob Brown",
      handle: "@bobbrown",
      content: "Can't wait to see new AI breakthroughs this week.",
      url: "https://twitter.com/bobbrown",
      retweetCount: 8,
      replyCount: 4,
      likeCount: 60,
    },
    {
      profilePicture: "https://picsum.photos/200",
      author: "Carol White",
      handle: "@carolwhite",
      content: "AI tools are making complex tasks simple.",
      url: "https://twitter.com/carolwhite",
      retweetCount: 12,
      replyCount: 2,
      likeCount: 70,
    },
  ],
  redditPosts: [
    {
      title: "An organ-chip model of ALS enables mechanistic and therapeutic discoveries",
      image: null,
      permalink: "https://www.reddit.com/r/singularity/comments/1ljuntv/an_organchip_model_of_als/",
      subreddit: "singularity",
      author: "CliveSvendsen",
      score: 780,
      numComments: 45,
    },
    {
      title: "Breakthrough brain-computer interface allows man with ALS to speak again",
      image: null,
      permalink: "https://www.reddit.com/r/science/comments/1esg9dd/breakthrough_braincomputer_interface_allows_man/",
      subreddit: "science",
      author: "UC_Davis_Health",
      score: 1120,
      numComments: 98,
    },
    {
      title: "Artificial intelligence model finds potential drug molecules a step closer",
      image: "https://external-preview.redd.it/jKui6NGlbOc12zKhDENC0CIokGq4V0q0NvHtUvoMWOA.jpg?width=640&crop=smart&auto=webp&s=61da491d88b2cfc35e822a2e179bc61ba4adae95",
      permalink: "https://www.reddit.com/r/Futurology/comments/vxrwch/artificial_intelligence_model_finds_potential/",
      subreddit: "Futurology",
      author: "AI_Researcher",
      score: 900,
      numComments: 120,
    },
  ],
  baseUrl: "localhost:3000",
};

export default function MarketingEmailExample() {
  return <MarketingEmail {...exampleProps} />;
}
