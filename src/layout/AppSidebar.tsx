"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  ChevronDownIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  FileIcon,
  FolderIcon,
  Business,
  GroupIcon,
  BellIcon,
  ChatIcon,
  DollarLineIcon,
  EnvelopeIcon,
  TaskIcon,
  ShootingStarIcon,
  BoltIcon,
  PageIcon,
} from "../icons/index";
import { useAuth } from "@/app/auth/useAuth";
import { getUserRole } from "@/app/api/types";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isSuperAdmin = userRole.toUpperCase() === "SUPER_ADMIN";

  // ── Business portal nav ──────────────────────────────────────────
  const businessNavItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <PieChartIcon />,
      name: "Reports",
      path: "/reports",
    },
    {
      icon: <GroupIcon />,
      name: "Users",
      subItems: [
        { name: "Customers", path: "/customers" },
        { name: "Cleaners", path: "/cleaners" },
        { name: "Team", path: "/team" },
      ],
    },
    {
      icon: <TableIcon />,
      name: "Booking & Schedules",
      subItems: [
        { name: "Calendar", path: "/calendar" },
        { name: "Bookings", path: "/bookings" },
        { name: "Dispatch", path: "/dispatch" },
        { name: "Recurring Schedules", path: "/recurring-schedules" },
      ],
    },
    {
      icon: <FileIcon />,
      name: "Cleaner Documents",
      path: "/cleaner-documents",
    },
    {
      icon: <FileIcon />,
      name: "Reviews",
      path: "/reviews",
    },
    {
      icon: <ShootingStarIcon />,
      name: "Coupons",
      path: "/coupons",
    },
    {
      icon: <BoltIcon />,
      name: "Gift Cards",
      path: "/gift-cards",
    },
    {
      icon: <TaskIcon />,
      name: "Waitlist",
      path: "/waitlist",
    },
    {
      icon: <ListIcon />,
      name: "Checklist Templates",
      path: "/checklist-templates",
    },
    {
      icon: <EnvelopeIcon />,
      name: "Support Tickets",
      path: "/support-tickets",
    },
    {
      icon: <FolderIcon />,
      name: "Inventory",
      path: "/inventory",
    },
    {
      icon: <DollarLineIcon />,
      name: "Payroll",
      path: "/payroll",
    },
  ];

  const businessOthersItems: NavItem[] = [
    {
      icon: <UserCircleIcon />,
      name: "User Profile",
      path: "/profile",
    },
    {
      icon: <Business />,
      name: "Business",
      subItems: [
        { name: "Business Settings", path: "/business-settings" },
        { name: "Pricing", path: "/pricing" },
        { name: "Website", path: "/website" },
        { name: "Services", path: "/services" },
        { name: "Compliance", path: "/compliance" },
        { name: "Audit-Trail", path: "/audit-trail" },
      ],
    },
    {
      icon: <BellIcon />,
      name: "Notifications",
      path: "/notifications",
    },
    {
      icon: <ChatIcon />,
      name: "Messages",
      path: "/messages",
    },
    {
      icon: <DollarLineIcon />,
      name: "Subscription",
      path: "/subscription",
    },
  ];

  // ── Super Admin portal nav ───────────────────────────────────────
  const superAdminNavItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Overview",
      path: "/admin",
    },
    {
      icon: <Business />,
      name: "Businesses",
      path: "/admin/businesses",
    },
    {
      icon: <DollarLineIcon />,
      name: "Subscriptions",
      path: "/admin/subscriptions",
    },
    {
      icon: <GroupIcon />,
      name: "Users",
      path: "/admin/users",
    },
    {
      icon: <EnvelopeIcon />,
      name: "Support tickets",
      path: "/admin/tickets",
    },
  ];

  const superAdminOthersItems: NavItem[] = [
    {
      icon: <UserCircleIcon />,
      name: "User Profile",
      path: "/profile",
    }
  ];

  const navItems = isSuperAdmin ? superAdminNavItems : businessNavItems;
  const othersItems = isSuperAdmin ? superAdminOthersItems : businessOthersItems;

  const renderMenuItems = (
      items: NavItem[],
      menuType: "main" | "others"
  ) => (
      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => (
            <li key={nav.name}>
              {nav.subItems ? (
                  <button
                      onClick={() => handleSubmenuToggle(index, menuType)}
                      className={`menu-item group  ${
                          openSubmenu?.type === menuType && openSubmenu?.index === index
                              ? "menu-item-active"
                              : "menu-item-inactive"
                      } cursor-pointer ${
                          !isExpanded && !isHovered
                              ? "lg:justify-center"
                              : "lg:justify-start"
                      }`}
                  >
              <span
                  className={` ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                        <span className={`menu-item-text`}>{nav.name}</span>
                    )}
                    {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronDownIcon
                            className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                                openSubmenu?.type === menuType &&
                                openSubmenu?.index === index
                                    ? "rotate-180 text-brand-500"
                                    : ""
                            }`}
                        />
                    )}
                  </button>
              ) : (
                  nav.path && (
                      <Link
                          href={nav.path}
                          className={`menu-item group ${
                              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                          }`}
                      >
                <span
                    className={`${
                        isActive(nav.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                            <span className={`menu-item-text`}>{nav.name}</span>
                        )}
                      </Link>
                  )
              )}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                  <div
                      ref={(el) => {
                        subMenuRefs.current[`${menuType}-${index}`] = el;
                      }}
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        height:
                            openSubmenu?.type === menuType && openSubmenu?.index === index
                                ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                : "0px",
                      }}
                  >
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                                href={subItem.path}
                                className={`menu-dropdown-item ${
                                    isActive(subItem.path)
                                        ? "menu-dropdown-item-active"
                                        : "menu-dropdown-item-inactive"
                                }`}
                            >
                              {subItem.name}
                              <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                            <span
                                className={`ml-auto ${
                                    isActive(subItem.path)
                                        ? "menu-dropdown-badge-active"
                                        : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                            >
                            new
                          </span>
                        )}
                                {subItem.pro && (
                                    <span
                                        className={`ml-auto ${
                                            isActive(subItem.path)
                                                ? "menu-dropdown-badge-active"
                                                : "menu-dropdown-badge-inactive"
                                        } menu-dropdown-badge `}
                                    >
                            pro
                          </span>
                                )}
                      </span>
                            </Link>
                          </li>
                      ))}
                    </ul>
                  </div>
              )}
            </li>
        ))}
      </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
      {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Exact match for most routes; /admin overview needs exact so sub-routes
  // don't keep "Overview" highlighted.
  const isActive = useCallback(
      (path: string) => {
        if (path === "/admin") return pathname === "/admin";
        return pathname === path || Boolean(pathname?.startsWith(path + "/"));
      },
      [pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
          prevOpenSubmenu &&
          prevOpenSubmenu.type === menuType &&
          prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
      <aside
          className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
              isExpanded || isMobileOpen
                  ? "w-[290px]"
                  : isHovered
                      ? "w-[290px]"
                      : "w-[90px]"
          }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
          onMouseEnter={() => !isExpanded && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
      >
        <div
            className={`py-8 flex  ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
        >
          <Link href={isSuperAdmin ? "/admin" : "/dashboard"}>
            {isExpanded || isHovered || isMobileOpen ? (
                <>
                  <Image
                      className="dark:hidden"
                      src="/images/logo/logo.svg"
                      alt="Logo"
                      width={150}
                      height={40}
                  />
                  <Image
                      className="hidden dark:block"
                      src="/images/logo/logo-dark.svg"
                      alt="Logo"
                      width={150}
                      height={40}
                  />
                </>
            ) : (
                <Image
                    src="/images/logo/logo-icon.svg"
                    alt="Logo"
                    width={32}
                    height={32}
                />
            )}
          </Link>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                        !isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                      isSuperAdmin ? (
                          "Platform"
                      ) : (
                          "Menu"
                      )
                  ) : (
                      <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>

              <div className="">
                <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                        !isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                      "Others"
                  ) : (
                      <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        </div>
      </aside>
  );
};

export default AppSidebar;