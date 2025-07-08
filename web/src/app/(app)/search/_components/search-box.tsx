import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Loader2, Send, MessageCircle, ChevronDown, WandSparkles } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useState, useRef } from "react";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SearchBoxProps {
  onRefine?: (refinedQuery: string) => void;
  currentQuery?: string;
  toolCount?: number;
  isLoading?: boolean;
  showDialogueMode?: boolean;
}

const placeholders = [
  "Build a website",
  "Automate my accounting",
  "Design 3D models",
];

export function SearchBox({
  onRefine,
  currentQuery = '',
  toolCount = 0,
  isLoading = false,
  showDialogueMode = true
}: SearchBoxProps = {}) {
  const [search, setSearch] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [confidence, setConfidence] = useState(0);
  
  // Chat functionality states
  const [isChatMode, setIsChatMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationInitialized = useRef(false);

  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });
  const [query, setQuery] = useQueryState("query", {
    shallow: true,
    defaultValue: "",
  });
  const [tags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [pricing] = useQueryState("pricing", {
    shallow: false,
    parse: (v) => (["free", "paid", "free-paid"].includes(v) ? v : undefined),
  });
  const [showResults, setShowResults] = useState(false);

  // API for continuing conversation
  const continueConversation = api.tools.continueConversation.useMutation({
    onSuccess: (data) => {
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
      
      // Always apply refinements if we have a search suggestion and onRefine callback
      // Remove the equality check that was causing refinements to be skipped
      if (data.searchSuggestion && onRefine) {
        onRefine(data.searchSuggestion);
      }
      
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  // API for starting conversation manually
  const startConversation = api.tools.startConversation.useMutation({
    onSuccess: (data) => {
      const initialConversation: ConversationMessage[] = [
        {
          role: 'user',
          content: currentQuery || search,
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
      ];
      
      setConversation(initialConversation);
      setIsChatMode(true);
      
      // Auto-expand after a brief delay for smooth transition
      setTimeout(() => setIsExpanded(true), 300);
    },
    onError: () => {
      // Handle error case
      console.error('Failed to start conversation');
    }
  });

  // Auto-exit chat mode when confidence is high enough
  useEffect(() => {
    const CONFIDENCE_THRESHOLD = 80;
    
    if (isChatMode && confidence >= CONFIDENCE_THRESHOLD && toolCount > 0) {
      // Add a final message explaining the exit
      const exitMessage: ConversationMessage = {
        role: 'assistant',
        content: `Great! I found ${toolCount} relevant tools with high confidence (${confidence}%). You can now browse the results below or start a new search.`,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, exitMessage]);
      
      // Persist the final refined query to URL when exiting with high confidence
      if (currentQuery !== query && onRefine) {
        onRefine(currentQuery + '::persist');
      }

      // Delay exit to allow user to see the improved results
      const exitTimer = setTimeout(() => {
        exitChatMode();
      }, 3000);

      return () => clearTimeout(exitTimer);
    }
  }, [confidence, isChatMode, toolCount, currentQuery, query, onRefine]);

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
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    const conversationHistory = conversation.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    continueConversation.mutate({
      originalQuery: query || '',
      message: newMessage.trim(),
      conversationHistory
    });
    
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  const startChat = () => {
    if (!currentQuery && !search) return;
    
    startConversation.mutate({
      query: currentQuery || search,
      tags: tags ?? undefined,
      pricing: pricing ?? undefined
    });
  };

  return (
    <div className="relative w-full">
      <div className="relative flex w-full flex-col items-center">
        {/* Main search/chat container - morphs dynamically */}
                  <div
            className={cn(
              "group relative w-full transition-all duration-500 ease-in-out",
              (search.length > 0 || isChatMode) && "glow-box",
              isChatMode && "border rounded-lg bg-card shadow-lg",
              isExpanded ? "min-h-[400px]" : "h-12"
            )}
        >
          {/* Original search input - stays visible but transforms */}
          <div className={cn(
            "relative transition-all duration-300",
            isChatMode && isExpanded && "border-b bg-muted/30 cursor-pointer hover:bg-muted/40"
          )}
          onClick={isChatMode && isExpanded ? exitChatMode : undefined}
          >
            <Input
              className={cn(
                "relative w-full border-none outline-none focus-visible:ring-0 transition-all duration-300",
                isChatMode ? "bg-transparent pl-12 pr-20 sm:pr-32 h-14" : "h-12 bg-secondary pl-12 pr-4",
                isChatMode && isExpanded && "pointer-events-none"
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

            {/* Get AI Help button - only show when not in chat mode and there's a query */}
            {!isChatMode && showDialogueMode && (currentQuery || search) && (
              <Button
                onClick={startChat}
                disabled={startConversation.isPending}
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 h-8 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {startConversation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Let&apos;s refine your search with AI
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Dialogue Mode
                  </>
                )}
              </Button>
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
                "transition-all duration-300 overflow-hidden flex flex-col",
                isExpanded ? "opacity-100 max-h-[450px]" : "opacity-0 max-h-0"
              )}
            >
              {/* AI info header */}
              {isExpanded && (
                <div 
                  className="flex-shrink-0 px-4 py-2 border-b bg-muted/20"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">AI</span>
                      </div>
                      <span className="text-muted-foreground">This is an AI chat designed to pinpoint your ideal AI solution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-muted-foreground",
                        toolCount === 0 && !isLoading && "text-orange-600 font-medium"
                      )}>
                        {isLoading ? "Searching..." : toolCount === 0 ? "No tools found" : `${toolCount} tools found`}
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {/* No tools found special message */}
              {isExpanded && toolCount === 0 && !isLoading && (
                <div className="flex-shrink-0 px-4 py-3 bg-orange-50 border-l-4 border-orange-400">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-orange-700">
                        I couldn&apos;t find any tools matching your search. Let&apos;s try refining your request to get better results.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {isExpanded && (
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-2 animate-in slide-in-from-bottom-2 duration-300",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">AI</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                          message.role === 'user'
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {message.content}
                      </div>
                      {message.role === 'user' && (
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium">You</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-2 justify-start animate-in slide-in-from-bottom-2 duration-300">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">AI</span>
                      </div>
                      <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Chat input - appears at bottom */}
              {isExpanded && (
                <div className="flex-shrink-0 border-t p-3 bg-card">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Describe what you're looking for..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isTyping}
                      className="flex-1 h-9 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isTyping}
                      size="sm"
                      className="px-3 h-9"
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


    </div>
  );
}
