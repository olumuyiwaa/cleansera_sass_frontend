"use client";

import React from "react";
import {SiteHeader,SiteFooter} from "@/app/(full-width-pages)/shared";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    return <div>{children}</div>;
}

