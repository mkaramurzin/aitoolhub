import MarketingEmail, { MarketingEmailProps } from "./marketing-email";
const exampleProps: MarketingEmailProps = {
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
    },
    {
      title: "Tech Giant Invests in AI",
      description:
        "A major tech company has announced a significant investment in AI technologies.",
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
      content: "AI is revolutionizing everything! #innovation",
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
  baseUrl: "localhost:3000",
};

export default function MarketingEmailExample() {
  return <MarketingEmail {...exampleProps} />;
}
