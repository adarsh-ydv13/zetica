import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";

const Dashboard = () => {
  const chat = useChat();

  const [chatInput, setChatInput] = useState("");
  const [searchChat, setSearchChat] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [copiedMessage, setCopiedMessage] = useState(null);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [typedContent, setTypedContent] = useState("");
  const shouldAnimateNextAI = useRef(false);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const currentMessages = chats[currentChatId]?.messages || [];

  const messagesToRender = isLoading && pendingQuestion
    ? [...currentMessages, { id: "pending-user-question", role: "user", content: pendingQuestion }]
    : currentMessages;

  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, []);

  useEffect(() => {
    if (!shouldAnimateNextAI.current) return;

    const latestAIMessage = [...currentMessages].reverse().find((message) => message.role === "ai");
    if (!latestAIMessage) return;

    shouldAnimateNextAI.current = false;
    const fullText = latestAIMessage.content || "";
    let position = 0;

    setTypingMessageId(latestAIMessage.id);
    setTypedContent("");

    const timer = window.setInterval(() => {
      position = Math.min(position + 4, fullText.length);
      setTypedContent(fullText.slice(0, position));

      if (position >= fullText.length) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          setTypingMessageId(null);
          setTypedContent("");
        }, 180);
      }
    }, 12);

    return () => window.clearInterval(timer);
  }, [currentMessages]);

  const handleSubmitMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = chatInput.trim();

    if (!trimmedMessage || isLoading) return;

    setPendingQuestion(trimmedMessage);
    shouldAnimateNextAI.current = true;

    chat.handleSendMessage({
      message: trimmedMessage,
      chatId: currentChatId,
      webSearch,
    });

    setChatInput("");
    setMobileSidebarOpen(false);
  };

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats);
    setMobileSidebarOpen(false);
  };

  const startNewChat = () => {
    window.location.reload();
  };

  const suggestions = [
    {
      icon: "✦",
      title: "Brainstorm ideas",
      description: "Turn your thoughts into creative ideas",
      prompt: "Help me brainstorm some creative ideas",
    },
    {
      icon: "⌕",
      title: "Explore a topic",
      description: "Discover something interesting",
      prompt: "Explain an interesting topic to me",
    },
    {
      icon: "⌘",
      title: "Write code",
      description: "Build, debug and improve your code",
      prompt: "Help me write and improve my code",
    },
  ];

  const chatList = Object.values(chats || {}).filter((item) =>
    item.title?.toLowerCase().includes(searchChat.toLowerCase())
  );

  const hasMessages = messagesToRender.length > 0 || isLoading;

  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(id);
      window.setTimeout(() => setCopiedMessage(null), 1800);
    } catch {
      setCopiedMessage(null);
    }
  };

  const exportChat = () => {
    const text = (chats[currentChatId]?.messages || [])
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n\n");

    if (!text) return;

    const blob = new Blob([text], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ai-workspace-chat.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  const sidebarContent = (
    <>
      <div className="flex h-[72px] shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-gradient-to-br from-purple-400/30 to-indigo-600/20 text-2xl text-purple-200 shadow-[0_0_25px_rgba(139,92,246,0.15)]">
            ✳
          </div>

          <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Nexora<span className="text-purple-400">AI</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-white/35">
              INTELLIGENCE WORKSPACE
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.07] hover:text-white md:flex"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? "»" : "«"}
        </button>

        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 md:hidden"
        >
          ✕
        </button>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={startNewChat}
          title="New Chat"
          className={`group flex w-full items-center gap-3 rounded-xl border border-purple-400/20 bg-gradient-to-r from-purple-500/20 to-indigo-500/10 px-3 py-3 text-sm font-semibold text-purple-100 transition duration-300 hover:border-purple-400/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.12)] ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <span className="text-xl">＋</span>
          {!sidebarCollapsed && <span>New Chat</span>}
        </button>
      </div>

      <div className={`mt-8 px-4 ${sidebarCollapsed ? "hidden" : "block"}`}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            Recent conversations
          </p>
          <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/40">
            {chatList.length}
          </span>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">
            ⌕
          </span>

          <input
            type="text"
            value={searchChat}
            onChange={(e) => setSearchChat(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.035] py-2.5 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-purple-400/40"
          />
        </div>
      </div>

      <div
        className={`sidebar-scroll mt-3 flex-1 space-y-1 overflow-y-auto px-3 ${
          sidebarCollapsed ? "pt-5" : ""
        }`}
      >
        {chatList.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openChat(item.id)}
            title={item.title || "New Conversation"}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all duration-200 ${
              currentChatId === item.id
                ? "border border-purple-400/20 bg-purple-500/[0.12] text-purple-200"
                : "border border-transparent text-white/45 hover:bg-white/[0.05] hover:text-white"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <span className="shrink-0 text-lg">◈</span>

            {!sidebarCollapsed && (
              <span className="truncate text-xs">
                {item.title || "New Conversation"}
              </span>
            )}
          </button>
        ))}

        {!sidebarCollapsed && chatList.length === 0 && (
          <p className="px-3 py-8 text-center text-xs text-white/25">
            No conversations found.
          </p>
        )}
      </div>

      {!sidebarCollapsed && (
        <div className="mx-3 mb-3 rounded-xl border border-purple-400/10 bg-gradient-to-r from-purple-500/[0.10] to-indigo-500/[0.04] px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-400/20 bg-purple-500/15 text-sm text-purple-300">
              ✦
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/85">Nexora workspace</p>
              <p className="mt-0.5 text-[10px] leading-4 text-white/40">Your ideas, all in one place.</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`border-t border-white/[0.07] p-3 ${
          sidebarCollapsed ? "flex justify-center" : ""
        }`}
      >
        <button
          type="button"
          title="Account"
          className={`flex w-full items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.05] ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-400/30 bg-gradient-to-br from-purple-400/30 to-indigo-500/30 text-sm font-bold text-purple-100">
            A
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold text-white/80">
                My Account
              </p>
              <p className="text-[10px] text-white/35">
                Personal workspace
              </p>
            </div>
          )}

          {!sidebarCollapsed && (
            <span className="text-white/30">···</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <main className="relative h-screen overflow-hidden bg-[#08080d] p-2 text-white md:p-3">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-purple-700/[0.08] blur-[140px]" />

      <div className="relative flex h-full gap-3">
        <aside
          className={`hidden shrink-0 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101017]/95 backdrop-blur-xl transition-all duration-300 md:flex ${
            sidebarCollapsed ? "w-[76px]" : "w-[270px]"
          }`}
        >
          {sidebarContent}
        </aside>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <aside className="flex h-full w-[285px] flex-col border-r border-white/10 bg-[#101017] shadow-2xl">
              {sidebarContent}
            </aside>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex-1 bg-black/70 backdrop-blur-sm"
              aria-label="Close sidebar"
            />
          </div>
        )}

        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c12]/95">
          <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4 md:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 md:hidden"
              >
                ☰
              </button>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2">
                <span className="text-purple-300">✦</span>
                <span className="text-xs font-medium text-white/80">
                  AI Assistant
                </span>
                <span className="text-xs text-white/35">⌄</span>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                <span className="text-[10px] text-white/35">
                  SYSTEM ONLINE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportChat}
                className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-white/60 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-purple-200"
              >
                <span className="mr-1.5">↥</span>
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </header>

          <div className="chat-scroll relative flex-1 overflow-y-auto px-4 pb-64 md:px-10 md:pb-64">
            {!hasMessages ? (
              <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center py-8 pb-16 text-center">
                <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-purple-400/20 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent shadow-[0_0_80px_rgba(139,92,246,0.13)]">
                  <div className="absolute inset-1.5 rounded-[17px] border border-white/[0.05]" />
                  <span className="bg-gradient-to-br from-purple-200 via-purple-400 to-indigo-400 bg-clip-text text-4xl text-transparent">
                    ✳
                  </span>
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.9)]" />
                </div>

                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.28em] text-purple-300/70">
                  YOUR INTELLIGENCE SPACE
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Think beyond
                  <span className="block bg-gradient-to-r from-purple-300 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    the ordinary.
                  </span>
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/40">
                  Ask questions, explore ideas, research topics and turn
                  complex thoughts into meaningful insights.
                </p>

                <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                  {suggestions.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setChatInput(item.prompt)}
                      className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-purple-500/[0.07] hover:shadow-[0_10px_35px_rgba(139,92,246,0.08)]"
                    >
                      <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-500/10 text-xl text-purple-300 transition group-hover:bg-purple-500/20">
                        {item.icon}
                      </span>

                      <span className="block text-sm font-semibold text-white/85">
                        {item.title}
                      </span>

                      <span className="mt-2 block text-xs leading-5 text-white/35">
                        {item.description}
                      </span>

                      <span className="mt-4 block text-purple-300/60 transition group-hover:translate-x-1 group-hover:text-purple-300">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-9 py-9">
                {messagesToRender.map((message, index) => (
                  <div
                    key={message.id || `${currentChatId}-${index}`}
                    className={`flex gap-3 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.role !== "user" && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 text-lg text-purple-300">
                        ✳
                      </div>
                    )}

                    <div
                      className={`min-w-0 max-w-[90%] rounded-2xl px-4 py-4 text-sm leading-7 md:text-base ${
                        message.role === "user"
                          ? "rounded-br-md border border-purple-400/15 bg-gradient-to-br from-purple-500/[0.18] to-indigo-500/[0.10] text-white"
                          : "flex-1 text-white/85"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap">
                          {message.content}
                        </p>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="mb-4 mt-6 text-2xl font-bold text-white">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="mb-3 mt-6 text-xl font-semibold text-white">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="mb-2 mt-5 text-lg font-semibold text-white">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-4 leading-8 last:mb-0">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-4 list-disc space-y-2 pl-6 marker:text-purple-400">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-4 list-decimal space-y-2 pl-6 marker:text-purple-400">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="pl-1">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-purple-200">
                                {children}
                              </strong>
                            ),
                            code: ({ children, className }) => (
                              <code
                                className={`rounded-md border border-purple-400/10 bg-purple-500/10 px-1.5 py-0.5 font-mono text-sm text-purple-200 ${className || ""}`}
                              >
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => {
                              const codeText = React.Children.toArray(children)
                                .map((child) =>
                                  typeof child === "string"
                                    ? child
                                    : child.props?.children || ""
                                )
                                .join("");

                              return (
                                <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#08080d]">
                                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                                    <span className="text-[10px] uppercase tracking-wider text-white/35">Code</span>
                                    <button
                                      type="button"
                                      onClick={() => copyText(codeText, `code-${index}`)}
                                      className="rounded-lg px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-purple-200"
                                    >
                                      {copiedMessage === `code-${index}` ? "Copied" : "Copy code"}
                                    </button>
                                  </div>
                                  <pre className="overflow-x-auto p-4 text-sm leading-6">
                                    {children}
                                  </pre>
                                </div>
                              );
                            },
                            blockquote: ({ children }) => (
                              <blockquote className="my-4 border-l-2 border-purple-400 pl-4 text-white/55">
                                {children}
                              </blockquote>
                            ),
                            table: ({ children }) => (
                              <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
                                <table className="w-full border-collapse text-left text-sm">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="border-b border-white/10 bg-white/[0.05] px-4 py-3 font-semibold text-purple-200">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border-b border-white/[0.06] px-4 py-3">
                                {children}
                              </td>
                            ),
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-300 underline decoration-purple-400/30 underline-offset-4 hover:text-purple-200"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.id === typingMessageId ? typedContent : message.content}
                        </ReactMarkdown>
                      )}
                      {message.role !== "user" && (
                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
                          <button
                            type="button"
                            onClick={() => copyText(message.content, `message-${index}`)}
                            className="rounded-lg px-2.5 py-1.5 text-xs text-white/40 transition hover:bg-white/[0.06] hover:text-purple-200"
                            title="Copy response"
                          >
                            {copiedMessage === `message-${index}` ? "✓ Copied" : "▢ Copy"}
                          </button>
                          <span className="text-white/10">|</span>
                          <button
                            type="button"
                            onClick={() => setFeedback((prev) => ({ ...prev, [index]: "up" }))}
                            className={`rounded-lg px-2.5 py-1.5 text-xs transition hover:bg-white/[0.06] ${
                              feedback[index] === "up" ? "text-emerald-300" : "text-white/40 hover:text-emerald-300"
                            }`}
                            title="Helpful response"
                            aria-pressed={feedback[index] === "up"}
                          >
                            ♡ Helpful
                          </button>
                          <button
                            type="button"
                            onClick={() => setFeedback((prev) => ({ ...prev, [index]: "down" }))}
                            className={`rounded-lg px-2.5 py-1.5 text-xs transition hover:bg-white/[0.06] ${
                              feedback[index] === "down" ? "text-rose-300" : "text-white/40 hover:text-rose-300"
                            }`}
                            title="Not helpful"
                            aria-pressed={feedback[index] === "down"}
                          >
                            ♡ Not helpful
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
                      ✳
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
                      <span className="ml-2 text-xs text-white/40">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-8 md:right-8">
            <form
              onSubmit={handleSubmitMessage}
              className="mx-auto max-w-3xl rounded-[20px] border border-white/[0.10] bg-[#15141d]/95 px-4 py-3 shadow-[0_15px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition duration-300 focus-within:border-purple-400/35 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.09)] md:px-5 md:py-4"
            >
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form.requestSubmit();
                  }
                }}
                placeholder="Ask anything. Explore everything..."
                rows={1}
                className="composer-input w-full resize-none overflow-y-auto bg-transparent px-1 py-2 text-[15px] leading-6 text-white outline-none placeholder:text-white/30 md:text-base"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-white/45">
                    <span className="text-purple-300">✳</span>
                    Nexora AI
                  </span>

                  <span className="hidden text-white/20 sm:inline">·</span>

                  <button
                    type="button"
                    onClick={() => setWebSearch((prev) => !prev)}
                    aria-pressed={webSearch}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition duration-200 ${
                      webSearch
                        ? "border-purple-400/40 bg-purple-500/15 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.12)]"
                        : "border-white/10 bg-white/[0.025] text-white/45 hover:border-purple-400/30 hover:text-purple-200"
                    }`}
                  >
                    <span>⌕</span>
                    Web Search
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        webSearch ? "bg-purple-300 shadow-[0_0_8px_#c084fc]" : "bg-white/20"
                      }`}
                    />
                  </button>

                  <span className="hidden text-[10px] text-white/25 sm:inline">
                    Shift + Enter for new line
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!chatInput.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-xl font-semibold text-white shadow-[0_4px_20px_rgba(139,92,246,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_5px_25px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send message"
                >
                  {isLoading ? "..." : "↑"}
                </button>
              </div>
            </form>

            <p className="mt-3 text-center text-[10px] text-white/25">
              {webSearch
                ? "Web Search enabled · Explore answers powered by internet sources."
                : "Nexora AI can make mistakes. Verify important information."}
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;