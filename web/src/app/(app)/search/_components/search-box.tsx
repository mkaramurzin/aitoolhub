import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFilterDrawer } from "@/store/useFilterDrawer";
import { api } from "@/trpc/react";
import {
  ChevronUp,
  Filter,
  Loader2,
  Send,
  WandSparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState, useRef } from "react";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SearchBoxProps {
  conversationResponse?: string;
  suggestedRefinements?: string[];
  confidence?: number;
  onRefine?: (refinedQuery: string) => void;
  currentQuery?: string;
  toolCount?: number;
}

const placeholders = [
  "Build a website",
  "Automate my accounting",
  "Design 3D models",
];

export function SearchBox({
  conversationResponse,
  suggestedRefinements = [],
  confidence = 0,
  onRefine,
  currentQuery = "",
  toolCount = 0,
}: SearchBoxProps = {}) {
  const [search, setSearch] = useState("");
  const { setOpen: setFilterDrawerOpen, open: filterDrawerOpen } =
    useFilterDrawer();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Chat functionality states
  const [isChatMode, setIsChatMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationInitialized = useRef(false);

  const [tags, setTags] = useQueryState("tags", {
    shallow: true,
    history: "push",
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [page, setPage] = useQueryState("page", {
    shallow: true,
    history: "push",
    parse: (v) => parseInt(v),
  });
  const router = useRouter();
  const [query, setQuery] = useQueryState("query", {
    shallow: true,
    defaultValue: "",
  });
  const [showResults, setShowResults] = useState(false);

  // API for continuing conversation
  const continueConversation = api.tools.continueConversation.useMutation({
    onSuccess: (data) => {
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);

      if (
        data.searchSuggestion &&
        data.searchSuggestion !== currentQuery &&
        onRefine
      ) {
        onRefine(data.searchSuggestion);
      }

      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  // Initialize chat mode when AI responds
  useEffect(() => {
    if (conversationResponse && !conversationInitialized.current) {
      setConversation([
        {
          role: "user",
          content: query || currentQuery,
          timestamp: new Date(),
        },
        {
          role: "assistant",
          content: conversationResponse,
          timestamp: new Date(),
        },
      ]);
      conversationInitialized.current = true;
      setIsChatMode(true);

      // Auto-expand after a brief delay for smooth transition
      setTimeout(() => setIsExpanded(true), 300);
    }
  }, [conversationResponse, query, currentQuery]);

  // Auto-exit chat mode when confidence is high enough or no conversation response
  useEffect(() => {
    const CONFIDENCE_THRESHOLD = 80; // Match the API threshold for regular search

    if (
      isChatMode &&
      (confidence >= CONFIDENCE_THRESHOLD || !conversationResponse)
    ) {
      // Add a final message explaining the exit
      if (confidence >= CONFIDENCE_THRESHOLD && toolCount > 0) {
        const exitMessage: ConversationMessage = {
          role: "assistant",
          content: `Great! I found ${toolCount} relevant tools with high confidence (${confidence}%). You can now browse the results below or start a new search.`,
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, exitMessage]);
      }

      // Delay exit to allow user to see the improved results
      const exitTimer = setTimeout(() => {
        exitChatMode();
      }, 3000); // 3 second delay to show the final message

      return () => clearTimeout(exitTimer);
    }
  }, [confidence, conversationResponse, isChatMode, toolCount]);

  // Reset when query changes significantly
  useEffect(() => {
    if (query !== currentQuery && conversationInitialized.current) {
      conversationInitialized.current = false;
      setConversation([]);
      setIsChatMode(false);
      setIsExpanded(false);
    }
  }, [query, currentQuery]);

  useEffect(() => {
    if (!isChatMode) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setPlaceholderIndex((current) => (current + 1) % placeholders.length);
          setIsTransitioning(false);
        }, 150);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isChatMode]);

  useEffect(() => {
    if (search.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [search]);

  useEffect(() => {
    if (query) {
      setSearch(query);
    }
  }, [query]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, isExpanded]);

  const handleSearch = () => {
    if (!search.trim()) return;
    setShowResults(false);
    setQuery(search);
    setPage(1);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || isTyping) return;

    const userMessage: ConversationMessage = {
      role: "user",
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const conversationHistory = conversation.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    continueConversation.mutate({
      originalQuery: query || "",
      message: newMessage.trim(),
      conversationHistory,
    });

    setNewMessage("");
  };

  const handleRefinementClick = (refinement: string) => {
    const refinedQuery = `${currentQuery} ${refinement}`.trim();
    if (onRefine) {
      onRefine(refinedQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isChatMode && isExpanded) {
        handleSendMessage();
      } else {
        handleSearch();
      }
    }
  };

  const exitChatMode = () => {
    setIsExpanded(false);
    setTimeout(() => {
      setIsChatMode(false);
      setConversation([]);
      conversationInitialized.current = false;
    }, 300);
  };

  return (
    <div className="relative flex w-full items-center">
      <div className="relative flex w-full flex-col items-center">
        {/* Main search/chat container - morphs dynamically */}
        <div
          className={cn(
            "group relative w-full transition-all duration-500 ease-in-out",
            (search.length > 0 || isChatMode) && "glow-box",
            isChatMode && "rounded-lg border bg-card shadow-lg",
            isExpanded ? "min-h-[400px]" : "h-12",
          )}
        >
          {/* Original search input - stays visible but transforms */}
          <div
            className={cn(
              "relative transition-all duration-300",
              isChatMode && isExpanded && "border-b bg-muted/30",
            )}
          >
            <Input
              className={cn(
                "relative w-full border-none outline-none transition-all duration-300 focus-visible:ring-0",
                isChatMode
                  ? "h-14 bg-transparent pl-12 pr-12"
                  : "h-12 bg-secondary pl-12 pr-4",
              )}
              value={isChatMode && isExpanded ? currentQuery : search}
              maxLength={100}
              onKeyDown={handleKeyPress}
              onChange={(e) => {
                if (!isChatMode) {
                  setSearch(e.target.value);
                }
              }}
              disabled={isChatMode && isExpanded}
              placeholder={isChatMode ? "Current search query" : ""}
            />

            <WandSparkles className="absolute left-4 top-1/2 size-5 -translate-y-1/2 transition-colors duration-300" />

            {/* Chat mode indicator */}
            {isChatMode && (
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">AI Chat</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exitChatMode}
                  className="h-6 w-6 p-0 hover:bg-destructive/10"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Original placeholder - only show in normal mode */}
            {!isChatMode && (
              <div
                className={`pointer-events-none absolute left-0 top-0 flex h-full w-full items-center pl-12 text-gray-500 ${search.length > 0 ? "hidden" : "block"}`}
              >
                <span
                  className={`transition-all duration-150 ${isTransitioning ? "translate-y-[-40%] opacity-0" : "translate-y-0 opacity-100"}`}
                >
                  {placeholders[placeholderIndex]}
                </span>
              </div>
            )}
          </div>

          {/* Expanded chat content - morphs in smoothly */}
          {isChatMode && (
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
              )}
            >
              {/* AI info header */}
              {isExpanded && (
                <div className="border-b bg-muted/20 px-4 py-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                          AI
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        Search Assistant • Confidence: {confidence}%
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-muted-foreground",
                        toolCount === 0 && "font-medium text-orange-600",
                      )}
                    >
                      {toolCount === 0
                        ? "No tools found"
                        : `${toolCount} tools found`}
                    </span>
                  </div>
                </div>
              )}

              {/* No tools found special message */}
              {isExpanded && toolCount === 0 && (
                <div className="border-l-4 border-orange-400 bg-orange-50 px-4 py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-orange-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-orange-700">
                        I couldn't find any tools matching your search. Let's
                        try refining your request to get better results.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {isExpanded && (
                <div className="max-h-64 space-y-3 overflow-y-auto p-4">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-2 duration-300 animate-in slide-in-from-bottom-2",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-medium text-primary">
                            AI
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                          message.role === "user"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {message.content}
                      </div>
                      {message.role === "user" && (
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                          <span className="text-xs font-medium">You</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start gap-2 duration-300 animate-in slide-in-from-bottom-2">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                          AI
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Suggested refinements */}
              {isExpanded && suggestedRefinements.length > 0 && (
                <div className="border-t bg-muted/10 px-4 pb-3">
                  <p className="mb-2 pt-2 text-xs font-medium text-muted-foreground">
                    Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedRefinements.map((refinement) => (
                      <Badge
                        key={refinement}
                        variant="outline"
                        className="cursor-pointer py-1 text-xs transition-all hover:scale-105 hover:bg-primary/20"
                        onClick={() => handleRefinementClick(refinement)}
                      >
                        {refinement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat input - appears at bottom */}
              {isExpanded && (
                <div className="border-t bg-card p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Continue the conversation..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isTyping}
                      className="h-9 flex-1 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isTyping}
                      size="sm"
                      className="h-9 px-3"
                    >
                      {isTyping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Button - stays in same position */}
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (filterDrawerOpen) return;
          setFilterDrawerOpen(true);
        }}
        variant={"secondary"}
        size="lg"
        className="relative ml-4 flex h-12 w-14 p-0"
      >
        {tags && tags.length > 0 && (
          <span className="absolute -right-2 -top-2 size-5 rounded-full bg-primary px-1">
            {tags.length}
          </span>
        )}
        <Filter />
      </Button>
    </div>
  );
}
