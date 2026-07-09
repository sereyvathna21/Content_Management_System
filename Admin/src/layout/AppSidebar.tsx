"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePermission } from "@/hooks/usePermission";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  // ADDED MATCHING ICONS BELOW:
  FileIcon,     // For Resource
  InfoIcon,          // For About-us
  LockIcon,          // For Role Permission
   TaskIcon, // For Audit Log
  MailIcon,          // For Contact
  VideoIcon,         // Optional: renamed or matching for News & Media
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavSubItem = {
  name: string;
  titleKey: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  permission?: string;
  anyOf?: string[];
};

type NavItem = {
  name: string;
  titleKey: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  anyOf?: string[];
  subItems?: NavSubItem[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    titleKey: "dashboard",
    path: "/dashboard",
    permission: "dashboard:read",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    titleKey: "calendar",
    path: "/calendar",
    permission: "calendar:read",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    titleKey: "profile",
    path: "/profile",
    permission: "profile:read",
  },

  {
    icon: <FileIcon />, // matched to Resource
    name: "Resource",
    titleKey: "resource",
    subItems: [
      { name: "Laws", titleKey: "laws", path: "/laws", pro: false, permission: "laws:read" },
      { name: "Publications", titleKey: "publications", path: "/publications", pro: false, permission: "publications:read" },
      { name: "Social Management", titleKey: "social", path: "/social", pro: false, permission: "social:read" },
    ],
  },
  {
    icon: <VideoIcon />, // matched to News & Media
    name: "News & Media",
    titleKey: "new",
    subItems: [
      { name: "News", titleKey: "news", path: "/news", pro: false, permission: "news:read" },
      { name: "Video", titleKey: "video", path: "/videos", pro: false, permission: "video:read" }
    ],
  },
  {
    icon: <MailIcon />, // matched to Contact
    name: "Contact",
    titleKey: "contact",
    path: "/contact",
    permission: "contact:read",
  },
  {
    icon: <InfoIcon />, // matched to About-us
    name: "About-us",
    titleKey: "aboutUs",
    path: "/about",
    permission: "about:read",
  },
];

const othersItems: NavItem[] = [
 
  {
    icon: < TaskIcon />, // matched to Audit Log
    name: "Audit Log",
    titleKey: "auditLog",
    path: "/audit",
    permission: "audit:read",
  },
  {
    icon: <LockIcon />, // matched to Role Permission
    name: "Role Permission",
    titleKey: "rolePermission",
    path: "/settings/roles",
    permission: "roles:read",
  },
  {
    icon: <InfoIcon />, // Using InfoIcon or any available icon
    name: "Telegram Config",
    titleKey: "telegramConfig",
    path: "/settings/telegram",
    permission: "telegram:read",
  },
  {
    icon: <UserCircleIcon />, // matched to User Management
    name: "User Management",
    titleKey: "userManagement",
    path: "/users",
    permission: "users:read",
  },
];

const AppSidebar: React.FC = () => {
  const t = useTranslations("Sidebar");
  const { can, canAny, permissions, isSuperAdmin } = usePermission();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const hasAccess = (item: { permission?: string; anyOf?: string[] }) => {
    if (item.permission) return can(item.permission);
    if (item.anyOf && item.anyOf.length > 0) return canAny(item.anyOf);
    return true;
  };

  const filteredNavItems = React.useMemo(() => {
    if (status === "loading") return navItems as NavItem[];

    return navItems
      .map((nav) => {
        if (nav.subItems) {
          const subItems = nav.subItems.filter(hasAccess);
          if (subItems.length === 0) return null;
          return { ...nav, subItems } as NavItem;
        }
        return hasAccess(nav) ? nav : null;
      })
      .filter(Boolean) as NavItem[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, isSuperAdmin, status]);

  const filteredOthersItems = React.useMemo(() => {
    if (status === "loading") return othersItems as NavItem[];

    return othersItems
      .map((nav) => {
        if (nav.subItems) {
          const subItems = nav.subItems.filter(hasAccess);
          if (subItems.length === 0) return null;
          return { ...nav, subItems } as NavItem;
        }
        return hasAccess(nav) ? nav : null;
      })
      .filter(Boolean) as NavItem[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, isSuperAdmin, status]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu((prev) => {
                if (prev && prev.type === (menuType as "main" | "others") && prev.index === index) {
                  return prev;
                }
                return {
                  type: menuType as "main" | "others",
                  index,
                };
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
  }, [filteredNavItems, filteredOthersItems, isActive, pathname]);

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

  useEffect(() => {
    const keys = Object.keys(subMenuRefs.current);
    if (keys.length === 0) return;
    keys.forEach((key) => {
      const el = subMenuRefs.current[key];
      if (!el) return;
      const h = el.scrollHeight || 0;
      setSubMenuHeight((prev) => {
        if (prev[key] === h) return prev;
        return { ...prev, [key]: h };
      });
    });
  }, [isExpanded, isHovered, isMobileOpen, pathname, filteredNavItems.length, filteredOthersItems.length]);

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

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.titleKey}>
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
                <span className={`menu-item-text`}>{t(nav.titleKey)}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-primary"
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
                  <span className={`menu-item-text`}>{t(nav.titleKey)}</span>
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
                  <li key={subItem.titleKey}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {t(subItem.titleKey)}
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
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo.svg"
                alt="Logo"
                width={300}
                height={40}
                
              />
              <Image
                className="hidden dark:block"
                src="/images/logo.svg"
                alt="Logo"
                width={300}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/favicon.svg"
              alt="Logo"
              width={60}
              height={60}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  t("menu")
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  t("others")
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredOthersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;