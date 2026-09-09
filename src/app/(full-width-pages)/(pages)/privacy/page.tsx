"use client";

import React, { useState, useEffect, useRef } from "react";
import { TOKENS, GLOBAL_CSS, SiteHeader, SiteFooter } from "@/app/(full-width-pages)/shared";
import {PRIVACY_SECTIONS} from "@/app/(full-width-pages)/data";


type SectionId = (typeof PRIVACY_SECTIONS)[number]["id"];

export default function PrivacyPage() {
    const [activeSection, setActiveSection] = useState<SectionId>("overview");
    const [scrollProgress, setScrollProgress] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement;
            const prog = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
            setScrollProgress(Math.min(prog, 100));

            PRIVACY_SECTIONS.forEach(({ id }) => {
                const sec = document.getElementById(id);
                if (sec && sec.getBoundingClientRect().top <= 120) {
                    setActiveSection(id as SectionId);
                }
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <>
            <style>{TOKENS}</style>
            <style>{GLOBAL_CSS}</style>

            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "3px",
                    width: `${scrollProgress}%`,
                    background: "linear-gradient(90deg, var(--gold-400), var(--gold-300))",
                    zIndex: 200,
                }}
            />

            <SiteHeader activePage="privacy" />

            {/* Hero */}
            <div style={{ background:"var(--navy-900)", padding:"64px 40px 72px", textAlign:"center" }}>
                <div className="fade-up">
                    <div style={{
                        display:"inline-flex", alignItems:"center", gap:"8px",
                        background:"rgba(196,146,34,.12)", border:"1px solid rgba(196,146,34,.25)",
                        borderRadius:"100px", padding:"6px 16px", marginBottom:"20px",
                    }}>
                        <span style={{ fontSize:"12px", fontWeight:600, color:"var(--gold-300)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Legal</span>
                    </div>
                    <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,46px)", color:"var(--white)", marginBottom:"14px" }}>
                        Privacy Policy
                    </h1>
                    <p style={{ color:"var(--navy-200)", fontSize:"15px", maxWidth:"480px", margin:"0 auto" }}>
                        Effective date: <strong style={{ color:"var(--white)" }}>1 June 2025</strong> · Last updated: <strong style={{ color:"var(--white)" }}>21 May 2026</strong>
                    </p>
                </div>
            </div>

            {/* Body */}
            <div style={{
                maxWidth:            "1120px",
                margin:              "0 auto",
                padding:             "48px 40px 80px",
                display:             "grid",
                gridTemplateColumns: "240px 1fr",
                gap:                 "48px",
                alignItems:          "start",
            }}>
                {/* Sticky sidebar */}
                <aside style={{
                    position:     "sticky",
                    top:          "84px",
                    background:   "var(--white)",
                    borderRadius: "var(--radius-lg)",
                    border:       "1px solid var(--border)",
                    overflow:     "hidden",
                    boxShadow:    "var(--shadow-sm)",
                }}>
                    <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", background:"var(--navy-50)" }}>
                        <p style={{ fontSize:"11px", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--navy-400)" }}>Contents</p>
                    </div>
                    <nav style={{ padding:"8px 0" }}>
                        {PRIVACY_SECTIONS.map((s) => {
                            const isActive = activeSection === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => scrollTo(s.id)}
                                    style={{
                                        width:"100%", textAlign:"left", padding:"9px 20px",
                                        background:      isActive ? "var(--navy-50)" : "none",
                                        border:          "none",
                                        borderLeftWidth: "3px",
                                        borderLeftStyle: "solid",
                                        borderLeftColor: isActive ? "var(--gold-400)" : "transparent",
                                        cursor:"pointer", fontFamily:"var(--font-body)",
                                        fontSize:"12.5px",
                                        fontWeight: isActive ? 600 : 400,
                                        color:      isActive ? "var(--navy-800)" : "var(--navy-400)",
                                        lineHeight:1.4, transition:"all .15s",
                                    }}
                                >
                                    {s.title}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main content */}
                <main ref={contentRef}>
                    {/* Summary banner */}
                    <div style={{
                        background:   "var(--gold-50)",
                        border:       "1px solid var(--gold-200)",
                        borderRadius: "var(--radius-md)",
                        padding:      "20px 24px",
                        marginBottom: "40px",
                        display:      "flex",
                        gap:          "14px",
                        alignItems:   "flex-start",
                    }}>
                        <span style={{ fontSize:"20px", flexShrink:0 }}>🔒</span>
                        <div>
                            <p style={{ fontWeight:600, fontSize:"14px", color:"var(--navy-800)", marginBottom:"6px" }}>What matters most</p>
                            <p style={{ fontSize:"13px", color:"var(--text-body)", lineHeight:1.7 }}>
                                We collect only what we need to run the platform. We never sell your data. Patient information (PHI) is anonymised in public views and encrypted everywhere. You can request access, correction, or deletion of your data at any time by emailing privacy@trabajohub.com.
                            </p>
                        </div>
                    </div>

                    {/* HIPAA badge */}
                    <div style={{
                        display:      "flex",
                        alignItems:   "center",
                        gap:          "12px",
                        background:   "var(--navy-50)",
                        border:       "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        padding:      "14px 20px",
                        marginBottom: "40px",
                    }}>
                        <span style={{ fontSize:"22px" }}>🏥</span>
                        <p style={{ fontSize:"13px", color:"var(--navy-700)", lineHeight:1.6 }}>
                            <strong>HIPAA Business Associate</strong> — Trabajo Hub operates as a Business Associate under HIPAA. All Protected Health Information (PHI) handled through the Platform is subject to the additional protections described in Section 5.
                        </p>
                    </div>

                    {PRIVACY_SECTIONS.map((section, idx) => (
                        <section
                            key={section.id}
                            id={section.id}
                            style={{ marginBottom:"48px", scrollMarginTop:"90px" }}
                        >
                            <h2 style={{
                                fontFamily:   "var(--font-display)",
                                fontSize:     "22px",
                                color:        "var(--navy-900)",
                                marginBottom: "20px",
                                paddingBottom:"12px",
                                borderBottom: "2px solid var(--border)",
                                display:      "flex",
                                alignItems:   "center",
                                gap:          "10px",
                            }}>
                                <span style={{
                                    width:"28px", height:"28px", borderRadius:"6px",
                                    background:"var(--navy-800)", color:"var(--gold-300)",
                                    fontSize:"12px", fontFamily:"var(--font-mono)", fontWeight:600,
                                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                                }}>
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                                {section.title.replace(/^\d+\.\s/, "")}
                            </h2>
                            {section.content.map((para, i) => (
                                <p key={i} style={{ fontSize:"14.5px", lineHeight:1.85, color:"var(--text-body)", marginBottom:"16px" }}>
                                    {para}
                                </p>
                            ))}
                        </section>
                    ))}

                    {/* CTA */}
                    <div style={{
                        background:   "var(--navy-900)",
                        borderRadius: "var(--radius-lg)",
                        padding:      "36px 40px",
                        textAlign:    "center",
                        marginTop:    "24px",
                    }}>
                        <h3 style={{ fontFamily:"var(--font-display)", fontSize:"20px", color:"var(--white)", marginBottom:"10px" }}>
                            Privacy questions or requests?
                        </h3>
                        <p style={{ fontSize:"14px", color:"var(--navy-200)", marginBottom:"24px" }}>
                            Our Privacy Officer responds within 30 days for all data rights requests.
                        </p>
                        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                            <a href="mailto:privacy@trabajohub.com" style={{
                                padding:"11px 24px", background:"var(--gold-400)", color:"var(--navy-900)",
                                borderRadius:"var(--radius-sm)", fontSize:"14px", fontWeight:700, textDecoration:"none",
                            }}>
                                Email privacy team
                            </a>
                            <a href="/terms" style={{
                                padding:"11px 24px", background:"rgba(255,255,255,.08)", color:"var(--white)",
                                border:"1px solid rgba(255,255,255,.15)", borderRadius:"var(--radius-sm)",
                                fontSize:"14px", fontWeight:600, textDecoration:"none",
                            }}>
                                View Terms of Service
                            </a>
                        </div>
                    </div>
                </main>
            </div>

            <SiteFooter />
        </>
    );
}