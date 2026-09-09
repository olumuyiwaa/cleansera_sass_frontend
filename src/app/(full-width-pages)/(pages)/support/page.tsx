"use client";

import React, {useEffect, useState} from "react";
import { TOKENS, GLOBAL_CSS, SiteHeader, SiteFooter } from "@/app/(full-width-pages)/shared";
import {FAQ_ITEMS, STATUS_ITEMS, CONTACT_CHANNELS, SECTIONS} from "../../data";
import ContactForm from "@/components/support/ContactForm";
import {supportApi, TicketDetail} from "@/app/api/support.api";


// ─── Sub-components ────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
    const normalizedStatus = (status.toLowerCase() as "operational" | "degraded" | "outage") || "operational";

    const colors: Record<"operational" | "degraded" | "outage", string> = {
        operational: "#22c55e",
        degraded: "#f59e0b",
        outage: "#ef4444",
    };

    const label = normalizedStatus === "operational" ? "Operational" :
        normalizedStatus === "degraded" ? "Degraded" : "Outage";

    const textColor = normalizedStatus === "operational" ? "#166534" :
        normalizedStatus === "degraded" ? "#92400e" : "#991b1b";

    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: textColor,
            fontWeight: 500,
        }}>
            <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: colors[normalizedStatus],
                boxShadow: `0 0 0 2px ${colors[normalizedStatus]}33`,
                display: "inline-block",
                animation: normalizedStatus === "operational" ? "none" : "pulse 1.5s infinite",
            }} />
            {label}
        </span>
    );
}

function AccordionItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{
            borderBottom: "1px solid var(--border)",
            overflow:     "hidden",
        }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width:          "100%",
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    gap:            "16px",
                    padding:        "20px 0",
                    background:     "none",
                    border:         "none",
                    cursor:         "pointer",
                    textAlign:      "left",
                    fontFamily:     "var(--font-body)",
                    fontSize:       "15px",
                    fontWeight:     open ? 600 : 500,
                    color:          open ? "var(--navy-900)" : "var(--navy-700)",
                    transition:     "color .2s",
                }}
            >
                <span>{q}</span>
                <span style={{
                    flexShrink:  0,
                    width:       "24px",
                    height:      "24px",
                    borderRadius:"50%",
                    background:  open ? "var(--navy-800)" : "var(--navy-50)",
                    color:       open ? "var(--gold-300)" : "var(--navy-400)",
                    display:     "flex",
                    alignItems:  "center",
                    justifyContent:"center",
                    fontSize:    "16px",
                    fontWeight:  300,
                    lineHeight:  1,
                    transition:  "all .25s",
                    transform:   open ? "rotate(45deg)" : "none",
                }}>+</span>
            </button>
            <div style={{
                maxHeight:  open ? "400px" : "0",
                overflow:   "hidden",
                transition: "max-height .35s cubic-bezier(.4,0,.2,1)",
            }}>
                <p style={{
                    margin:      "0 0 20px",
                    padding:     "0 40px 0 0",
                    fontSize:    "14px",
                    lineHeight:  1.75,
                    color:       "#4a5568",
                }}>{a}</p>
            </div>
        </div>
    );
}

export default function SupportPage() {
    const [activeCategory, setActiveCategory] = useState(0);
    const [activeSection, setActiveSection] = useState("");
    const [scrollProgress, setScrollProgress] = useState(0);
    const [ticketNumber, setTicketNumber] = useState("");
    const [email, setEmail] = useState("");
    const [trackedTicket, setTrackedTicket] = useState<TicketDetail| null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [trackError, setTrackError] = useState("");

    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement;
            const prog = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
            setScrollProgress(Math.min(prog, 100));

            SECTIONS.forEach(({ id }) => {
                const sec = document.getElementById(id);
                if (sec && sec.getBoundingClientRect().top <= 120) {
                    setActiveSection(id);
                }
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleTrackTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketNumber.trim() || !email.trim()) return;

        setIsTracking(true);
        setTrackError("");
        setTrackedTicket(null);

        try {
            const ticket = await supportApi.trackTicket(ticketNumber.trim(), email.trim());
            setTrackedTicket(ticket);
        } catch (err: any) {
            setTrackError(err.message || "Ticket not found or invalid email.");
        } finally {
            setIsTracking(false);
        }
    };

    return (
        <>
            <style>{TOKENS}</style>
            <style>{GLOBAL_CSS}</style>

            {/* Reading progress bar */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "3px",
                    width: `${scrollProgress}%`,
                    background: "linear-gradient(90deg, var(--gold-400), var(--gold-300))",
                    zIndex: 200,
                    transition: "width .1s linear",
                }}
            />

            <SiteHeader activePage="support" />

            {/* ── Hero ────────────────────────────────── */}
            <div style={{
                background:   "var(--navy-900)",
                padding:      "72px 40px 80px",
                textAlign:    "center",
                position:     "relative",
                overflow:     "hidden",
            }}>
                {/* decorative rings */}
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"600px", height:"600px", borderRadius:"50%", border:"1px solid rgba(196,146,34,.08)", pointerEvents:"none" }} />
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"400px", height:"400px", borderRadius:"50%", border:"1px solid rgba(196,146,34,.12)", pointerEvents:"none" }} />

                <div className="fade-up" style={{ position:"relative", zIndex:1 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(196,146,34,.12)", border:"1px solid rgba(196,146,34,.25)", borderRadius:"100px", padding:"6px 16px", marginBottom:"24px" }}>
                        <span style={{ fontSize:"12px", fontWeight:600, color:"var(--gold-300)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Support Centre</span>
                    </div>
                    <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(32px,5vw,52px)", color:"var(--white)", lineHeight:1.1, marginBottom:"16px" }}>
                        How can we help you?
                    </h1>
                    <p style={{ fontSize:"16px", color:"var(--navy-200)", maxWidth:"520px", margin:"0 auto 36px", lineHeight:1.7 }}>
                        Browse the FAQ, check system status, or get in touch with our support team.
                    </p>
                    {/* search bar */}
                    {/*<div style={{ maxWidth:"480px", margin:"0 auto", position:"relative" }}>*/}
                    {/*    <svg style={{ position:"absolute", left:"16px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(155,174,210,.6)" strokeWidth="2">*/}
                    {/*        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>*/}
                    {/*    </svg>*/}
                    {/*    <input*/}
                    {/*        type="search"*/}
                    {/*        placeholder="Search the knowledge base…"*/}
                    {/*        style={{*/}
                    {/*            width:       "100%",*/}
                    {/*            padding:     "14px 16px 14px 44px",*/}
                    {/*            background:  "rgba(255,255,255,.07)",*/}
                    {/*            border:      "1.5px solid rgba(255,255,255,.12)",*/}
                    {/*            borderRadius:"var(--radius-md)",*/}
                    {/*            color:       "var(--white)",*/}
                    {/*            fontFamily:  "var(--font-body)",*/}
                    {/*            fontSize:    "15px",*/}
                    {/*            outline:     "none",*/}
                    {/*            boxSizing:   "border-box",*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*</div>*/}
                </div>
            </div>

            <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"60px 40px" }}>

                {/* ── System Status ────────────────────── */}
                <section style={{ marginBottom:"64px" }} className="fade-up">
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"12px" }}>
                        <h2 style={{ fontFamily:"var(--font-display)", fontSize:"22px", color:"var(--navy-900)" }}>System Status</h2>
                        <span style={{ fontSize:"12px", color:"#718096", fontFamily:"var(--font-mono)" }}>Last checked: just now</span>
                    </div>
                    <div style={{
                        background:   "var(--white)",
                        borderRadius: "var(--radius-lg)",
                        border:       "1px solid var(--border)",
                        overflow:     "hidden",
                        boxShadow:    "var(--shadow-sm)",
                    }}>
                        {STATUS_ITEMS.map((item, i) => (
                            <div key={i} style={{
                                display:        "flex",
                                justifyContent: "space-between",
                                alignItems:     "center",
                                padding:        "14px 24px",
                                borderBottom:   i < STATUS_ITEMS.length - 1 ? "1px solid var(--border)" : "none",
                            }}>
                                <span style={{ fontSize:"14px", fontWeight:500, color:"var(--navy-700)" }}>{item.label}</span>
                                <StatusDot status={item.status} />
                            </div>
                        ))}
                        <div style={{ padding:"12px 24px", background:"var(--navy-50)", borderTop:"1px solid var(--border)" }}>
                            <span style={{ fontSize:"12px", color:"#718096" }}>1 service experiencing degraded performance. </span>
                            <a href="#" style={{ fontSize:"12px", color:"var(--navy-600)", fontWeight:600, textDecoration:"none" }}>View incident report →</a>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ──────────────────────────────── */}
                <section style={{ marginBottom:"64px" }}>
                    <h2 style={{ fontFamily:"var(--font-display)", fontSize:"22px", color:"var(--navy-900)", marginBottom:"24px" }}>
                        Frequently Asked Questions
                    </h2>

                    {/* Category tabs */}
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"28px" }}>
                        {FAQ_ITEMS.map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveCategory(i)}
                                style={{
                                    padding:      "8px 16px",
                                    borderRadius: "100px",
                                    border:       "1.5px solid",
                                    borderColor:  i === activeCategory ? "var(--navy-700)" : "var(--border)",
                                    background:   i === activeCategory ? "var(--navy-800)" : "var(--white)",
                                    color:        i === activeCategory ? "var(--gold-300)" : "var(--navy-500)",
                                    fontFamily:   "var(--font-body)",
                                    fontSize:     "13px",
                                    fontWeight:   600,
                                    cursor:       "pointer",
                                    transition:   "all .2s",
                                    display:      "flex",
                                    alignItems:   "center",
                                    gap:          "6px",
                                }}
                            >
                                <span>{cat.icon}</span>
                                {cat.category}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        background:   "var(--white)",
                        borderRadius: "var(--radius-lg)",
                        border:       "1px solid var(--border)",
                        padding:      "8px 32px 4px",
                        boxShadow:    "var(--shadow-sm)",
                    }}>
                        {FAQ_ITEMS[activeCategory].items.map((item, i) => (
                            <AccordionItem key={i} q={item.q} a={item.a} />
                        ))}
                    </div>
                </section>

                {/* ── Track Your Ticket ──────────────────────────────── */}
                <section style={{ marginBottom: "64px" }} className="fade-up">
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--navy-900)", marginBottom: "20px" }}>
                        Track Your Ticket
                    </h2>
                    <p style={{ color: "#64748b", marginBottom: "24px" }}>
                        Enter your ticket number and email to view status and replies.
                    </p>

                    <div style={{
                        background: "var(--white)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        padding: "32px",
                        boxShadow: "var(--shadow-sm)",
                    }}>
                        <form onSubmit={handleTrackTicket} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                                    Ticket Number
                                </label>
                                <input
                                    type="text"
                                    value={ticketNumber}
                                    onChange={(e) => setTicketNumber(e.target.value)}
                                    placeholder="TKT-20260619-0042"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                    }}
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={isTracking}
                                    style={{
                                        width: "100%",
                                        padding: "12px 24px",
                                        background: "var(--navy-800)",
                                        color: "var(--gold-300)",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                        cursor: isTracking ? "not-allowed" : "pointer",
                                        opacity: isTracking ? 0.7 : 1,
                                    }}
                                >
                                    {isTracking ? "Searching..." : "Track Ticket"}
                                </button>
                            </div>
                        </form>

                        {trackError && (
                            <p style={{ color: "#ef4444", marginTop: "16px", textAlign: "center" }}>{trackError}</p>
                        )}

                        {/* Ticket Result */}
                        {trackedTicket && (
                            <div style={{ marginTop: "32px", padding: "24px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                    <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                                        Ticket #{trackedTicket.ticketNumber}
                                    </h3>
                                    <span style={{
                                        padding: "4px 12px",
                                        borderRadius: "9999px",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        background: trackedTicket.status === "RESOLVED" ? "#dcfce7" : "#fef3c7",
                                        color: trackedTicket.status === "RESOLVED" ? "#166534" : "#854d0e"
                                    }}>
                                        {trackedTicket.status.replace("_", " ")}
                                    </span>
                                </div>

                                <p style={{ fontWeight: 500, marginBottom: "12px" }}>{trackedTicket.subject}</p>

                                <div style={{ marginTop: "20px" }}>
                                    <h4 style={{ fontSize: "14px", marginBottom: "8px", color: "#475569" }}>Conversation</h4>
                                    {trackedTicket.replies.map((reply) => (
                                        <div key={reply.id} style={{
                                            padding: "16px",
                                            background: "white",
                                            borderRadius: "8px",
                                            marginBottom: "12px",
                                            border: "1px solid #e2e8f0"
                                        }}>
                                            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>
                                                {reply.authorEmail || "Support Team"} • {new Date(reply.createdAt).toLocaleDateString()}
                                            </div>
                                            <p style={{ whiteSpace: "pre-wrap" }}>{reply.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Contact channels ─────────────────── */}
                <section style={{ marginBottom:"64px" }}>
                    <h2 style={{ fontFamily:"var(--font-display)", fontSize:"22px", color:"var(--navy-900)", marginBottom:"24px" }}>
                        Contact Us
                    </h2>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:"16px", marginBottom:"40px" }}>
                        {CONTACT_CHANNELS.map((ch, i) => (
                            <div key={i} style={{
                                background:   "var(--white)",
                                borderRadius: "var(--radius-lg)",
                                border:       "1px solid var(--border)",
                                padding:      "28px",
                                boxShadow:    "var(--shadow-sm)",
                                transition:   "box-shadow .2s, transform .2s",
                            }}
                                 onMouseEnter={(e) => { e.currentTarget.style.boxShadow="var(--shadow-md)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                                 onMouseLeave={(e) => { e.currentTarget.style.boxShadow="var(--shadow-sm)"; e.currentTarget.style.transform="none"; }}
                            >
                                <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"var(--navy-50)", color:"var(--navy-700)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
                                    {ch.icon}
                                </div>
                                <h3 style={{ fontFamily:"var(--font-display)", fontSize:"17px", marginBottom:"6px", color:"var(--navy-900)" }}>{ch.label}</h3>
                                <p style={{ fontSize:"13px", color:"#718096", lineHeight:1.6, marginBottom:"12px" }}>{ch.description}</p>
                                <div style={{ fontSize:"12px", fontFamily:"var(--font-mono)", color:"var(--navy-400)", marginBottom:"16px", background:"var(--navy-50)", padding:"6px 10px", borderRadius:"6px", display:"inline-block" }}>
                                    ⏱ {ch.sla}
                                </div>
                                <br/>
                                <a href={ch.action} style={{
                                    display:      "inline-flex",
                                    alignItems:   "center",
                                    gap:          "6px",
                                    padding:      "9px 18px",
                                    background:   "var(--navy-800)",
                                    color:        "var(--gold-300)",
                                    borderRadius: "var(--radius-sm)",
                                    fontSize:     "13px",
                                    fontWeight:   600,
                                    textDecoration:"none",
                                    transition:   "background .2s",
                                }}>
                                    {ch.actionLabel} →
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Contact form */}
                    <div style={{
                        background:   "var(--white)",
                        borderRadius: "var(--radius-lg)",
                        border:       "1px solid var(--border)",
                        padding:      "40px",
                        boxShadow:    "var(--shadow-sm)",
                    }}>
                        <h3 style={{ fontFamily:"var(--font-display)", fontSize:"20px", marginBottom:"6px", color:"var(--navy-900)" }}>Send a support ticket.</h3>
                        <p style={{ fontSize:"14px", color:"#718096", marginBottom:"28px" }}>We'll respond to your email within one business day.</p>
                        <ContactForm />
                    </div>
                </section>

            </div>

            <SiteFooter />
        </>
    );
}
