"use client";

import React, {
    ChangeEvent,
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { authFetch } from "@/app/api/authFetch";
import { Conversation, Message, Pagination } from "@/app/api/types";
import { ChatIcon, InfoIcon, PaperPlaneIcon } from "@/icons";
import { useAuth } from "@/app/auth/useAuth";
import { useAlert } from "@/hooks/useAlert";
import AlertModal from "@/components/modals/AlertModal/AlertModal";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import {sessionService} from "@/app/services/session.service";

// ─── Types ───────────────────────────────────────────────────────────────────

type UserSearchResult = {
    id: string;
    email: string;
    role: string;
    status: string;
    verificationStatus: string;
    createdAt: string;
    adminProfile?: { firstName: string; lastName: string } | null;
    cleanerProfile?: { firstName: string; lastName: string; designation?: string } | null;
    businessMember?: { businessId: string; jobTitle?: string | null } | null;
};

// Shape of the payload the backend emits on "new_message"
interface NewMessagePayload {
    conversationId: string;
    message: Message;
}

// Shape of the payload the backend emits on "message_deleted"
interface MessageDeletedPayload {
    conversationId: string;
    messageId: string;
}

// Shape of the payload the backend emits on "message_read"
interface MessageReadPayload {
    messageId: string;
    readAt: string;
}

// Shape of the payload the backend emits on "user_typing"
interface UserTypingPayload {
    userId: string;
    conversationId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return "Something went wrong.";
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatTime(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);
}

function getSenderName(message: Message) {
    const adminProfile = message.sender?.adminProfile;
    const cleanerProfile = message.sender?.cleanerProfile;
    if (adminProfile) return `${adminProfile.firstName} ${adminProfile.lastName}`;
    if (cleanerProfile) return `${cleanerProfile.firstName} ${cleanerProfile.lastName}`;
    return message.sender?.role || "User";
}

function getUserDisplayName(user: UserSearchResult) {
    if (user.adminProfile) return `${user.adminProfile.firstName} ${user.adminProfile.lastName}`;
    if (user.cleanerProfile) return `${user.cleanerProfile.firstName} ${user.cleanerProfile.lastName}`;
    return user.email;
}

function getUserSubtitle(user: UserSearchResult) {
    const parts = [
        user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c),
        user.role,
    ];
    if (user.cleanerProfile?.designation) parts.push(user.cleanerProfile.designation);
    if (user.businessMember?.jobTitle) parts.push(user.businessMember.jobTitle);
    return parts.join(" · ");
}

function formatRole(role: string) {
    return role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function getParticipantDisplayName(participant: any) {
    if (participant.adminProfile)
        return `${participant.adminProfile.firstName} ${participant.adminProfile.lastName} · (${formatRole(participant.role)})`;
    if (participant.cleanerProfile)
        return `${participant.cleanerProfile.firstName} ${participant.cleanerProfile.lastName} · (${formatRole(participant.role)})`;
    if (participant.businessMember)
        return `${participant.businessMember.firstName} ${participant.businessMember.lastName} · (${participant.businessMember.jobTitle ?? formatRole(participant.role)})`;
    return participant.email;
}

function getOtherParticipantName(conversation: Conversation, currentUserId: string) {
    const others = conversation.participants?.filter((p) => p.id !== currentUserId);
    if (!others || others.length === 0) return "Unknown";
    return others.map(getParticipantDisplayName).join(", ");
}

function getLastMessagePreview(conversation: Conversation) {
    const lastMessage = conversation.messages?.[0];
    if (!lastMessage) return "No messages yet.";
    if (lastMessage.content) return lastMessage.content;
    if (lastMessage.attachmentType) return "Attachment";
    return "Message";
}

function isImageAttachment(type?: string | null) {
    return Boolean(type?.startsWith("image/"));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MessagesPage() {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [conversationPagination, setConversationPagination] = useState<Pagination | null>(null);

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagePagination, setMessagePagination] = useState<Pagination | null>(null);

    const [conversationPage, setConversationPage] = useState(1);
    const [limit] = useState(10);
    const [messageLimit] = useState(50);

    const { user } = useAuth();
    const currentUserId = useMemo(() => user?.id || "", [user]);

    const [recipientId, setRecipientId] = useState("");
    const [businessId, setBusinessId] = useState("");

    const [messageText, setMessageText] = useState("");

    const [unreadCount, setUnreadCount] = useState(0);

    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isStartingConversation, setIsStartingConversation] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState("");

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string | null>(null);
    const [previewName, setPreviewName] = useState<string | null>(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Who is currently typing in the selected conversation (by userId)
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const typingTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const [recipientSearch, setRecipientSearch] = useState("");
    const [selectedRecipient, setSelectedRecipient] = useState<UserSearchResult | null>(null);
    const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);

    const router = useRouter();

    // ── Socket ────────────────────────────────────────────────────────────────

    const { joinConversation, leaveConversation, emitTyping, on } = useSocket({
        onConnect: () => console.log("[Socket] connected"),
        onDisconnect: () => console.log("[Socket] disconnected"),
    });

    // ── Auto-dismiss notifications ────────────────────────────────────────────

    useEffect(() => {
        if (!error) return;
        const t = window.setTimeout(() => setError(""), 5000);
        return () => window.clearTimeout(t);
    }, [error]);

    useEffect(() => {
        if (!successMessage) return;
        const t = window.setTimeout(() => setSuccessMessage(""), 4000);
        return () => window.clearTimeout(t);
    }, [successMessage]);

    // ── Redirect if unauthenticated ───────────────────────────────────────────

    useEffect(() => {
        if (!isLoadingConversations && user === null) {
            router.replace("/");
        }
    }, [user, isLoadingConversations, router]);

    // ── Conversation query string ─────────────────────────────────────────────

    const conversationQuery = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(conversationPage));
        params.set("limit", String(limit));
        return params.toString();
    }, [conversationPage, limit]);

    // ── User search ───────────────────────────────────────────────────────────

    const searchUsers = useCallback(async (searchValue: string) => {
        const trimmedSearch = searchValue.trim();
        if (trimmedSearch.length < 2) { setUserResults([]); return; }
        setIsSearchingUsers(true);
        setError("");
        try {
            const params = new URLSearchParams({ page: "1", limit: "10", search: trimmedSearch });
            const result = await authFetch(`/users/chat?${params.toString()}`, { method: "GET" });
            if (!result.success) throw new Error(result.message || "Unable to search users.");
            setUserResults(result.data || []);
        } catch (err) {
            setError(getErrorMessage(err));
            setUserResults([]);
        } finally {
            setIsSearchingUsers(false);
        }
    }, []);

    useEffect(() => {
        if (selectedRecipient && recipientSearch === getUserDisplayName(selectedRecipient)) return;
        const timeout = window.setTimeout(() => searchUsers(recipientSearch), 350);
        return () => window.clearTimeout(timeout);
    }, [recipientSearch, searchUsers, selectedRecipient]);

    // ── Unread count ──────────────────────────────────────────────────────────

    const fetchUnreadCount = useCallback(async () => {
        try {
            const result = await authFetch(`/messages/unread-count`, { method: "GET" });
            if (!result.success) throw new Error(result.message);
            setUnreadCount(result.data?.unreadCount || 0);
        } catch {
            setUnreadCount(0);
        }
    }, []);

    // ── Conversations ─────────────────────────────────────────────────────────

    const fetchConversations = useCallback(async () => {
        setIsLoadingConversations(true);
        setError("");
        try {
            const result = await authFetch(`/messages/conversations?${conversationQuery}`, { method: "GET" });
            if (!result.success) throw new Error(result.message || "Unable to load conversations.");
            setConversations(result.data || []);
            setConversationPagination(result.pagination || null);
            await fetchUnreadCount();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoadingConversations(false);
        }
    }, [conversationQuery, fetchUnreadCount]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // ── Messages ──────────────────────────────────────────────────────────────

    const fetchMessages = useCallback(
        async (conversationId: string, page = 1, prepend = false) => {
            setIsLoadingMessages(true);
            setError("");
            try {
                const result = await authFetch(
                    `/messages/conversations/${conversationId}/messages?page=${page}&limit=${messageLimit}`,
                    { method: "GET" }
                );
                if (!result.success) throw new Error(result.message || "Unable to load messages.");

                const items: Message[] = result.data || [];
                setMessages((previous) => {
                    if (!prepend || page === 1) return items;
                    const existingIds = new Set(previous.map((m) => m.id));
                    return [...items.filter((m) => !existingIds.has(m.id)), ...previous];
                });

                setMessagePagination(result.pagination || null);
                await fetchUnreadCount();

                if (!prepend || page === 1) {
                    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                }
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setIsLoadingMessages(false);
            }
        },
        [messageLimit, fetchUnreadCount]
    );

    // ── Socket event subscriptions ────────────────────────────────────────────
    //
    // We use a stable ref for `selectedConversation` so the socket listeners
    // registered once never go stale.

    const selectedConvRef = useRef<Conversation | null>(null);
    useEffect(() => { selectedConvRef.current = selectedConversation; }, [selectedConversation]);

    const currentUserIdRef = useRef(currentUserId);
    useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

    useEffect(() => {
        // new_message ─────────────────────────────────────────────────────────
        const unsubNewMessage = on("new_message", (raw) => {
            const message = raw as Message;   // ← the payload IS the message
            const { conversationId } = message;

            if (!message?.id || !conversationId) {
                console.warn("new_message: unexpected payload", raw);
                fetchConversations();
                fetchUnreadCount();
                return;
            }

            if (selectedConvRef.current?.id === conversationId) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            }

            fetchConversations();
            fetchUnreadCount();
        });

        // message_deleted ─────────────────────────────────────────────────────
        const unsubDeleted = on("message_deleted", (raw) => {
            const { messageId } = raw as MessageDeletedPayload;
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId
                        ? { ...m, content: null, attachmentUrl: null, attachmentKey: null, attachmentSignedUrl: null }
                        : m
                )
            );
        });

        // message_read ────────────────────────────────────────────────────────
        const unsubRead = on("message_read", (raw) => {
            const { messageId, readAt } = raw as MessageReadPayload;
            setMessages((prev) =>
                prev.map((m) => (m.id === messageId ? { ...m, status: "READ", readAt } : m))
            );
            fetchUnreadCount();
        });

        // conversation_updated ────────────────────────────────────────────────
        const unsubConvUpdated = on("conversation_updated", () => {
            fetchConversations();
        });

        // user_typing ─────────────────────────────────────────────────────────
        const unsubTyping = on("user_typing", (raw) => {
            const { userId, conversationId } = raw as UserTypingPayload;

            // Only show indicator when we're in that conversation and it's not us
            if (
                selectedConvRef.current?.id !== conversationId ||
                userId === currentUserIdRef.current
            ) return;

            setTypingUsers((prev) => new Set(prev).add(userId));

            // Clear after 3 s of silence
            clearTimeout(typingTimerRef.current[userId]);
            typingTimerRef.current[userId] = setTimeout(() => {
                setTypingUsers((prev) => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            }, 3000);
        });

        return () => {
            unsubNewMessage();
            unsubDeleted();
            unsubRead();
            unsubConvUpdated();
            unsubTyping();
        };
    }, [on, fetchConversations, fetchUnreadCount]);

    // ── Join / leave socket room when selected conversation changes ───────────

    useEffect(() => {
        if (!selectedConversation) return;
        joinConversation(selectedConversation.id);
        return () => leaveConversation(selectedConversation.id);
    }, [selectedConversation, joinConversation, leaveConversation]);

    // ── Select conversation ───────────────────────────────────────────────────

    async function handleSelectConversation(conversation: Conversation) {
        setSelectedConversation(conversation);
        setMessages([]);
        setMessagePagination(null);
        setSuccessMessage("");
        setTypingUsers(new Set());
        await fetchMessages(conversation.id, 1, false);
    }

    // ── Start conversation ────────────────────────────────────────────────────

    async function handleStartConversation(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsStartingConversation(true);
        setError("");
        setSuccessMessage("");
        try {
            const selectedRecipientId = selectedRecipient?.id || recipientId.trim();
            if (!selectedRecipientId) throw new Error("Please search and select a recipient.");

            const result = await authFetch(`/messages/conversations`, {
                method: "POST",
                body: JSON.stringify({
                    recipientId: selectedRecipientId,
                    businessId: businessId.trim() || undefined,
                }),
            });
            if (!result.success) throw new Error(result.message || "Unable to start conversation.");

            const conversation: Conversation = result.data;
            setSuccessMessage(result.message || "Conversation ready.");
            setRecipientId("");
            setRecipientSearch("");
            setSelectedRecipient(null);
            setUserResults([]);
            setBusinessId("");
            setConversationPage(1);
            setSelectedConversation(conversation);
            await fetchConversations();
            await fetchMessages(conversation.id, 1, false);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsStartingConversation(false);
        }
    }

    // ── Send message ──────────────────────────────────────────────────────────

    async function sendMessage(text: string) {
        if (!selectedConversation || !text.trim()) return;
        setIsSendingMessage(true);
        setError("");
        setSuccessMessage("");
        try {
            const result = await authFetch(
                `/messages/conversations/${selectedConversation.id}/messages`,
                { method: "POST", body: JSON.stringify({ content: text.trim() }) }
            );
            if (!result.success) throw new Error(result.message || "Unable to send message.");

            // Append optimistically; the socket "new_message" event from other
            // participants will be de-duplicated in the listener above.
            setMessages((prev) => {
                if (prev.some((m) => m.id === result.data.id)) return prev;
                return [...prev, result.data];
            });
            setMessageText("");
            await fetchConversations();
            await fetchUnreadCount();
            window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSendingMessage(false);
        }
    }

    // Replace handleSendMessage with:
    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Case 1: file is staged — upload it with optional caption
        if (pendingFile) {
            const file = pendingFile;
            const caption = messageText.trim() || undefined;

            setPendingFile(null);
            setMessageText("");
            setIsUploadingAttachment(true);
            setError("");

            try {
                const token = sessionService.getAccessToken();
                const formData = new FormData();
                formData.append("file", file);
                if (caption) formData.append("caption", caption);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/messages/conversations/${selectedConversation!.id}/attachments`,
                    {
                        method: "POST",
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        body: formData,
                    }
                );

                const result = await res.json();
                if (!result.success) throw new Error(result.message || "Unable to upload attachment.");

                setMessages((prev) => {
                    if (prev.some((m) => m.id === result.data.id)) return prev;
                    return [...prev, result.data];
                });

                await fetchConversations();
                await fetchUnreadCount();
                window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setIsUploadingAttachment(false);
            }
            return;
        }

        // Case 2: plain text
        sendMessage(messageText);
    }
    // ── Typing indicator emission ─────────────────────────────────────────────

    const typingEmitThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleMessageTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setMessageText(e.target.value);
        if (!selectedConversation) return;
        if (typingEmitThrottleRef.current) return; // already scheduled
        emitTyping(selectedConversation.id);
        typingEmitThrottleRef.current = setTimeout(() => {
            typingEmitThrottleRef.current = null;
        }, 2000); // emit at most once every 2 s
    }

    // ── Upload attachment ─────────────────────────────────────────────────────
    const attachmentInputRef = useRef<HTMLInputElement | null>(null);

    function handleAttachmentSelected(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !selectedConversation) return;
        setPendingFile(file);
        // Focus textarea so user can type a caption immediately
    }

    function clearPendingFile() {
        setPendingFile(null);
    }

    function formatFileSize(bytes: number) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    // ── Delete message ────────────────────────────────────────────────────────

    const { showAlert, closeAlert, isOpen, alertData } = useAlert();

    async function handleDeleteMessage(messageId: string) {
        if (!messageId) return;
        showAlert({
            type: "warning",
            title: "Delete Message",
            message: "Are you sure you want to delete this message? This action cannot be undone.",
            confirmText: "Yes, Delete Message",
            icon: (
                <svg className="text-warning-600 dark:text-orange-400" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M32.1445 19.0002C32.1445 26.2604 26.2589 32.146 18.9987 32.146C11.7385 32.146 5.85287 26.2604 5.85287 19.0002C5.85287 11.7399 11.7385 5.85433 18.9987 5.85433C26.2589 5.85433 32.1445 11.7399 32.1445 19.0002ZM18.9987 35.146C27.9158 35.146 35.1445 27.9173 35.1445 19.0002C35.1445 10.0831 27.9158 2.85433 18.9987 2.85433C10.0816 2.85433 2.85287 10.0831 2.85287 19.0002C2.85287 27.9173 10.0816 35.146 18.9987 35.146ZM21.0001 26.0855C21.0001 24.9809 20.1047 24.0855 19.0001 24.0855L18.9985 24.0855C17.894 24.0855 16.9985 24.9809 16.9985 26.0855C16.9985 27.19 17.894 28.0855 18.9985 28.0855L19.0001 28.0855C20.1047 28.0855 21.0001 27.19 21.0001 26.0855ZM18.9986 10.1829C19.827 10.1829 20.4986 10.8545 20.4986 11.6829L20.4986 20.6707C20.4986 21.4992 19.827 22.1707 18.9986 22.1707C18.1701 22.1707 17.4986 21.4992 17.4986 20.6707L17.4986 11.6829C17.4986 10.8545 18.1701 10.1829 18.9986 10.1829Z" />
                </svg>
            ),
            onConfirm: async () => {
                setDeletingMessageId(messageId);
                setError("");
                setSuccessMessage("");
                try {
                    const result = await authFetch(`/messages/${messageId}`, { method: "DELETE" });
                    if (!result.success) throw new Error(result.message || "Unable to delete message.");

                    // Optimistic update — socket "message_deleted" will sync other clients
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === messageId
                                ? { ...m, content: null, attachmentUrl: null, attachmentKey: null, attachmentSignedUrl: null }
                                : m
                        )
                    );
                    setSuccessMessage(result.message || "Message deleted successfully.");
                    await fetchConversations();
                    showAlert({ type: "success", message: "Message has been deleted." });
                } catch (err) {
                    const errorMsg = getErrorMessage(err);
                    setError(errorMsg);
                    showAlert({ type: "error", message: errorMsg });
                } finally {
                    setDeletingMessageId("");
                }
            },
        });
    }

    // ── Mark message read ─────────────────────────────────────────────────────

    async function handleMarkMessageRead(messageId: string) {
        setError("");
        try {
            const result = await authFetch(`/messages/${messageId}/read`, { method: "PATCH" });
            if (!result.success) throw new Error(result.message || "Unable to mark message as read.");

            // Optimistic update; socket "message_read" propagates to the sender
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId ? { ...m, status: "READ", readAt: new Date().toISOString() } : m
                )
            );
            await fetchUnreadCount();
            await fetchConversations();
        } catch {
            // non-critical — silently ignore
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // JSX
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Toast notifications */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
                {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 h-[calc(100vh-120px)] flex flex-col">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Conversations
                        </h2>
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                            Unread: {unreadCount}
                        </span>
                    </div>

                    {/* Start conversation form */}
                    <form onSubmit={handleStartConversation} className="mb-5 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                            Start Conversation
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="relative">
                                    <input
                                        value={recipientSearch}
                                        onChange={(event) => {
                                            setRecipientSearch(event.target.value);
                                            setSelectedRecipient(null);
                                            setRecipientId("");
                                        }}
                                        placeholder="Search by name or email"
                                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                    />
                                    {recipientSearch.trim().length >= 2 && !selectedRecipient ? (
                                        <div className="absolute left-0 right-0 top-12 z-50 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                            {isSearchingUsers ? (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Searching users...</div>
                                            ) : userResults.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No users found.</div>
                                            ) : (
                                                userResults.map((u) => (
                                                    <button
                                                        key={u.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRecipient(u);
                                                            setRecipientId(u.id);
                                                            setRecipientSearch(getUserDisplayName(u));
                                                            setUserResults([]);
                                                        }}
                                                        className="block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                                                    >
                                                        <span className="block text-sm font-medium text-gray-800 dark:text-white/90">{getUserDisplayName(u)}</span>
                                                        <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{getUserSubtitle(u)}</span>
                                                        <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">{u.status}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                {selectedRecipient ? (
                                    <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 dark:border-brand-500/30 dark:bg-brand-500/10">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                                                    Selected: {getUserDisplayName(selectedRecipient)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-brand-600 dark:text-brand-300">
                                                    {getUserSubtitle(selectedRecipient)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedRecipient(null); setRecipientId(""); setRecipientSearch(""); setUserResults([]); }}
                                                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <button
                                type="submit"
                                disabled={isStartingConversation || !selectedRecipient}
                                className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isStartingConversation ? "Starting..." : "Start Conversation"}
                            </button>
                        </div>
                    </form>

                    {/* Conversation list */}
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {isLoadingConversations ? (
                            <div className="rounded-xl border border-gray-200 p-5 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                Loading conversations...
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 p-5 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                No conversations yet.
                            </div>
                        ) : (
                            conversations.map((conversation) => {
                                const isSelected = selectedConversation?.id === conversation.id;
                                return (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => handleSelectConversation(conversation)}
                                        className={`w-full rounded-xl border p-4 text-left transition ${
                                            isSelected
                                                ? "border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10"
                                                : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                                                    {getOtherParticipantName(conversation, currentUserId)}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                                    {getLastMessagePreview(conversation)}
                                                </p>
                                            </div>
                                            {conversation.unreadCount ? (
                                                <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                                                    {conversation.unreadCount}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-2 text-xs text-gray-400">
                                            {formatDateTime(conversation.lastMessageAt || conversation.createdAt)}
                                        </p>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="mt-5 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            disabled={!conversationPagination?.hasPrev && conversationPage <= 1}
                            onClick={() => setConversationPage((p) => Math.max(p - 1, 1))}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Previous
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Page {conversationPagination?.page ?? conversationPage} of{" "}
                            {conversationPagination?.totalPages ?? 1}
                        </p>
                        <button
                            type="button"
                            disabled={conversationPagination ? !conversationPagination.hasNext : conversations.length < limit}
                            onClick={() => setConversationPage((p) => p + 1)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* ── RIGHT SIDE: ACTIVE CHAT ──────────────────────────────── */}
                <div className="flex flex-1 flex-col bg-gray-50 dark:bg-gray-950 h-[calc(100vh-120px)]">
                    {selectedConversation ? (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900 shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                                        {getOtherParticipantName(selectedConversation, currentUserId).charAt(0)}
                                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                            {getOtherParticipantName(selectedConversation, currentUserId)}
                                        </h2>
                                        {typingUsers.size > 0 ? (
                                            <span className="text-[11px] font-medium text-brand-500 dark:text-brand-400 animate-pulse">
                                                typing…
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-medium text-green-600 dark:text-green-400">
                                                Available
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <InfoIcon />
                                </button>
                            </div>

                            {/* Load older messages */}
                            {messagePagination?.hasNext && (
                                <div className="flex justify-center px-6 pt-4">
                                    <button
                                        type="button"
                                        disabled={isLoadingMessages}
                                        onClick={() => fetchMessages(selectedConversation.id, (messagePagination?.page ?? 1) + 1, true)}
                                        className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    >
                                        {isLoadingMessages ? "Loading..." : "Load older messages"}
                                    </button>
                                </div>
                            )}

                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F7F9] dark:bg-gray-950">
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === currentUserId;
                                    const deleted = !msg.content && !msg.attachmentKey && !msg.attachmentSignedUrl;
                                    const isDeleting = deletingMessageId === msg.id;

                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                                                <span className="text-[12px] font-bold text-gray-900 dark:text-white mb-1">
                                                    {isMe ? "You" : getSenderName(msg)}
                                                </span>
                                                <div className={`relative px-4 py-2.5 text-sm shadow-sm transition-all ${
                                                    isMe
                                                        ? "bg-brand-600 text-white rounded-2xl rounded-tr-none"
                                                        : "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700"
                                                }`}>
                                                    {deleted ? (
                                                        <span className="italic opacity-70">This message was deleted</span>
                                                    ) : (
                                                        <>
                                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                            {msg.attachmentSignedUrl && (
                                                                <div className="mt-2 overflow-hidden rounded-lg">
                                                                    {isImageAttachment(msg.attachmentType) ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setPreviewUrl(msg.attachmentSignedUrl!);
                                                                                setPreviewType(msg.attachmentType ?? null);
                                                                                setPreviewName(msg.attachmentKey?.split("/").pop() ?? "Image");
                                                                            }}
                                                                            className="block w-full p-0 border-none bg-transparent cursor-pointer"
                                                                        >
                                                                            <img
                                                                                src={msg.attachmentSignedUrl}
                                                                                className="max-h-60 w-full object-cover rounded-lg"
                                                                                alt="attachment"
                                                                            />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setPreviewUrl(msg.attachmentSignedUrl!);
                                                                                setPreviewType(msg.attachmentType ?? null);
                                                                                setPreviewName(msg.attachmentKey?.split("/").pop() ?? "File");
                                                                            }}
                                                                            className={`flex w-full items-center gap-2 rounded-lg p-2.5 text-xs font-medium transition-colors ${
                                                                                isMe
                                                                                    ? "bg-white/10 hover:bg-white/20 text-white"
                                                                                    : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                                            }`}
                                                                        >
                                                                            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                                                                                <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                                                                            </svg>
                                                                            <span className="truncate">{msg.attachmentKey?.split("/").pop() ?? "File"}</span>
                                                                            <svg className="ml-auto h-3.5 w-3.5 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                                                                <circle cx="12" cy="12" r="3"/>
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Meta: time + delivery status + delete */}
                                                <div className="mt-1 flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-medium text-gray-400 uppercase">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                    {isMe && !deleted && (
                                                        <>
                                                            <span className="text-gray-400">
                                                                {msg.status === "READ" ? (
                                                                    <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                        <path d="M2 12l5 5L20 4" /><path d="M7 12l5 5L20 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                        <path d="M20 6L9 17l-5-5" />
                                                                    </svg>
                                                                )}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteMessage(msg.id)}
                                                                disabled={isDeleting}
                                                                className="text-[10px] text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                                                            >
                                                                {isDeleting ? "…" : "Delete"}
                                                            </button>
                                                        </>
                                                    )}
                                                    {!isMe && msg.status !== "READ" && !deleted && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMarkMessageRead(msg.id)}
                                                            className="text-[10px] text-brand-500 hover:text-brand-600 transition-colors"
                                                        >
                                                            Mark read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Typing bubble */}
                                {typingUsers.size > 0 && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-1 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                                        </div>
                                    </div>
                                )}

                                <div ref={bottomRef} />
                            </div>

                            {/* File preview — shown above input when a file is staged */}
                            {pendingFile && (
                                <div className="mx-3 mb-1 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                        {pendingFile.type.startsWith("image/") ? (
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                <circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                                                <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-gray-800 dark:text-white/90">
                                            {pendingFile.name}
                                        </p>
                                        <p className="text-[11px] text-gray-400">{formatFileSize(pendingFile.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearPendingFile}
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M18 6 6 18M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Message input bar */}
                            <div className="bg-white p-1 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                                {/* Hidden file input — triggered by the paperclip button */}
                                <input
                                    ref={attachmentInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleAttachmentSelected}
                                />

                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-end gap-2 rounded-xl bg-gray-100 p-1.5 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
                                >
                                    {/* Paperclip — opens file picker directly, no inline form */}
                                    {!pendingFile && (
                                    <button
                                        type="button"
                                        disabled={isUploadingAttachment}
                                        onClick={() => attachmentInputRef.current?.click()}
                                        className={`p-2 transition-colors ${
                                            isUploadingAttachment
                                                ? "text-brand-500 animate-pulse"
                                                : "text-gray-500 hover:text-brand-600"
                                        }`}
                                        title={isUploadingAttachment ? "Uploading..." : "Attach file"}
                                    >
                                        {isUploadingAttachment ? (
                                            /* Spinner while uploading */
                                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                            </svg>
                                        )}
                                    </button>
                                    )}
                                    <textarea
                                        value={messageText}
                                        onChange={handleMessageTextChange}
                                        placeholder={pendingFile ? "Add a caption…" : "Type a message…"}
                                        rows={1}
                                        className="max-h-32 flex-1 border-none bg-transparent py-2.5 text-sm focus:ring-0 dark:text-white placeholder:text-gray-500 resize-none"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                // Reuse the same unified send logic
                                                if (pendingFile) {
                                                    handleSendMessage(e as any);
                                                } else {
                                                    sendMessage(messageText);
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageText.trim() || isSendingMessage}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white transition-all hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 shadow-sm"
                                    >
                                        <PaperPlaneIcon />
                                    </button>
                                </form>
                                <div className="mt-1 text-center text-[10px] text-gray-400">
                                    Press Enter to send · Shift + Enter for new line
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty state */
                        <div className="flex flex-1 flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-950">
                            <div className="mb-6 rounded-full bg-brand-50 p-8 dark:bg-brand-500/10">
                                <svg className="h-16 w-16 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.00002 12.0957C4.00002 7.67742 7.58174 4.0957 12 4.0957C16.4183 4.0957 20 7.67742 20 12.0957C20 16.514 16.4183 20.0957 12 20.0957H5.06068L6.34317 18.8132C6.48382 18.6726 6.56284 18.4818 6.56284 18.2829C6.56284 18.084 6.48382 17.8932 6.34317 17.7526C4.89463 16.304 4.00002 14.305 4.00002 12.0957ZM12 2.5957C6.75332 2.5957 2.50002 6.849 2.50002 12.0957C2.50002 14.4488 3.35633 16.603 4.77303 18.262L2.71969 20.3154C2.50519 20.5299 2.44103 20.8525 2.55711 21.1327C2.6732 21.413 2.94668 21.5957 3.25002 21.5957H12C17.2467 21.5957 21.5 17.3424 21.5 12.0957C21.5 6.849 17.2467 2.5957 12 2.5957ZM7.62502 10.8467C6.93467 10.8467 6.37502 11.4063 6.37502 12.0967C6.37502 12.787 6.93467 13.3467 7.62502 13.3467H7.62512C8.31548 13.3467 8.87512 12.787 8.87512 12.0967C8.87512 11.4063 8.31548 10.8467 7.62512 10.8467H7.62502ZM10.75 12.0967C10.75 11.4063 11.3097 10.8467 12 10.8467H12.0001C12.6905 10.8467 13.2501 11.4063 13.2501 12.0967C13.2501 12.787 12.6905 13.3467 12.0001 13.3467H12C11.3097 13.3467 10.75 12.787 10.75 12.0967ZM16.375 10.8467C15.6847 10.8467 15.125 11.4063 15.125 12.0967C15.125 12.787 15.6847 13.3467 16.375 13.3467H16.3751C17.0655 13.3467 17.6251 12.787 17.6251 12.0967C17.6251 11.4063 17.0655 10.8467 16.3751 10.8467H16.375Z" fill="currentColor" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Conversations</h2>
                            <p className="mt-2 max-w-sm text-gray-500 dark:text-gray-400">
                                Connect with your team instantly. Select a chat from the sidebar to start collaborating.
                            </p>
                            {/*<button*/}
                            {/*    type="button"*/}
                            {/*    onClick={() => document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()}*/}
                            {/*    className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700 transition-all"*/}
                            {/*>*/}
                            {/*    New Conversation*/}
                            {/*</button>*/}
                        </div>
                    )}
                </div>
            </div>


            {alertData && (
                <AlertModal
                    isOpen={isOpen}
                    onClose={closeAlert}
                    type={alertData.type}
                    title={alertData.title}
                    message={alertData.message}
                    icon={alertData.icon}
                    confirmText={alertData.confirmText}
                    onConfirm={alertData.onConfirm}
                />
            )}

            {previewUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div
                        className="relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-3">
                            <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90 max-w-[80%]">
                                {previewName}
                            </p>
                            <div className="flex items-center gap-2">
                                <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                download={previewName ?? true}
                                className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                                Download
                            </a>
                            <button
                                type="button"
                                onClick={() => setPreviewUrl(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-50 dark:bg-gray-950 p-4">
                        {isImageAttachment(previewType) ? (
                            <img
                                src={previewUrl}
                                alt={previewName ?? "attachment"}
                                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                            />
                        ) : previewType === "application/pdf" ? (
                            <iframe
                                src={previewUrl}
                                className="h-[70vh] w-full rounded-lg border-0"
                                title={previewName ?? "document"}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-12 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10">
                                    <svg className="h-10 w-10 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                        <path d="M10 9H8M16 13H8M16 17H8" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                        {previewName}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        This file type cannot be previewed in the browser.
                                    </p>
                                </div>
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                download={previewName ?? true}
                                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                                >
                                Download to view
                            </a>
                            </div>
                            )}
                    </div>
                </div>
                </div>
                )}
        </div>
    );
}