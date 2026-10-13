"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Building2,
  Check,
  ChevronDown,
  Package,
  PanelLeft,
  Search,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSidebar,
} from "@/components/ui/sidebar";

import {
  type DashboardUser,
  DashboardUserMenu,
} from "./dashboard-user-menu";

interface DashboardNavbarProps {
  user: DashboardUser;
  homeHref: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

type GlobalSearchType =
  | "products"
  | "companies"
  | "users";

const searchOptions: {
  value: GlobalSearchType;
  label: string;
  placeholder: string;
  route: string;
  icon: React.ElementType;
}[] = [
  {
    value: "products",
    label: "Products",
    placeholder: "Search products...",
    route: "/products",
    icon: Package,
  },
  {
    value: "companies",
    label: "Companies",
    placeholder: "Search companies...",
    route: "/companies",
    icon: Building2,
  },
  {
    value: "users",
    label: "Users",
    placeholder: "Search users...",
    route: "/users",
    icon: Users,
  },
];

export function DashboardNavbar({
  user,
  homeHref,
  showSearch = true,
  searchPlaceholder,
}: DashboardNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { state, openMobile, setOpenMobile, toggleSidebar } = useSidebar();

  const expanded = state === "expanded";
  const [compact, setCompact] = React.useState(true);

  React.useEffect(() => {
    const viewport = window.matchMedia("(max-width: 1023px)");
    const updateViewport = () => setCompact(viewport.matches);
    updateViewport();
    viewport.addEventListener("change", updateViewport);
    return () => viewport.removeEventListener("change", updateViewport);
  }, []);

  const [searchType, setSearchType] =
    React.useState<GlobalSearchType>(
      "products",
    );

  const [searchValue, setSearchValue] =
    React.useState("");

  const [dropdownOpen, setDropdownOpen] =
    React.useState(false);

  const searchRef =
    React.useRef<HTMLDivElement>(null);

  const selectedOption =
    searchOptions.find(
      (option) =>
        option.value === searchType,
    ) ?? searchOptions[0];

  const SelectedIcon =
    selectedOption.icon;

  /*
   * Close dropdown when clicking outside.
   */
  React.useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node,
        )
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /*
   * Close dropdown when pressing Escape.
   */
  React.useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /*
   * Clear the navbar search after navigating
   * to another admin page.
   */
  React.useEffect(() => {
    setSearchValue("");
    setDropdownOpen(false);
  }, [pathname]);

  function handleSearch() {
    const value =
      searchValue.trim();

    if (!value) {
      return;
    }

    router.push(
      `${selectedOption.route}?search=${encodeURIComponent(
        value,
      )}`,
    );
  }

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();

      handleSearch();
    }
  }

  function handleSearchTypeChange(
    value: GlobalSearchType,
  ) {
    setSearchType(value);

    setSearchValue("");

    setDropdownOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#e7e8f3] bg-white">
      <div className="flex min-h-16 flex-wrap items-center py-2 lg:py-0">
        {/* -------------------------------------------------
            LOGO
        ------------------------------------------------- */}
        <div
          className={`hidden h-16 shrink-0 items-center lg:flex border-r border-[#e7e8f3] transition-[width] duration-200 lg:flex ${
            expanded
              ? "w-[250px] 2xl:w-[280px] px-4"
              : "w-[62px] px-2"
          }`}
        >
          <Link
            href={homeHref}
            className="flex h-full w-full items-center justify-center"
          >
            {expanded ? (
              <Image
                src="/images/logo/coolerguru-logo-image.png"
                alt="CoolerGuru"
                width={155}
                height={52}
                priority
                className="h-[50px] w-[145px] object-contain"
              />
            ) : (
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#f0efff] font-bold text-admin-14 text-[#2720a8]">
                CG
              </div>
            )}
          </Link>
        </div>

        {/* -------------------------------------------------
            MAIN NAVBAR CONTENT
        ------------------------------------------------- */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left side */}
          <div className="contents">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              id="admin-navigation-toggle"
              aria-controls="admin-mobile-navigation"
              aria-label="Toggle admin navigation"
              aria-expanded={compact ? openMobile : expanded}
              className="size-10 shrink-0"
              onClick={() => {
                if (compact) {
                  setOpenMobile(!openMobile);
                } else {
                  toggleSidebar();
                }
              }}
            >
              <PanelLeft />
            </Button>

            <Link href={homeHref} aria-label="CoolerGuru admin home" className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 font-bold text-primary lg:hidden">
              CG
            </Link>

            {showSearch && (
              <div
                ref={searchRef}
                className="relative order-last w-full min-w-0 lg:order-none lg:flex-1 lg:max-w-[700px]"
              >
                {/* -------------------------------------------------
                    SEARCH BAR
                ------------------------------------------------- */}
                <div className="flex h-11 w-full items-center rounded-[8px] border border-[#d9daf0] bg-white shadow-[0_1px_3px_rgba(39,32,168,0.05)] transition-all focus-within:border-[#9d99df] focus-within:ring-2 focus-within:ring-[#2720a8]/10">
                  {/* Search Type Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setDropdownOpen(
                        (previous) =>
                          !previous,
                      )
                    }
                    className={`flex h-full w-[125px] sm:w-[150px] shrink-0 items-center justify-between gap-2 border-r border-[#e6e6f1] bg-[#fafaff] px-1 m-2 text-left transition-colors ${
                      dropdownOpen
                        ? "bg-[#f3f2ff]"
                        : "hover:bg-[#f7f7ff]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <SelectedIcon className="size-[15px] shrink-0 text-[#2720a8]" />

                      <span className="truncate text-admin-14 font-semibold text-[#2720a8]">
                        {selectedOption.label}
                      </span>
                    </span>

                    <ChevronDown
                      className={`size-[14px] shrink-0 text-[#777b9b] transition-transform duration-200 ${
                        dropdownOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {/* Search Input */}
                  <div className="relative flex min-w-0 flex-1 items-center">
                    <Search className="pointer-events-none absolute left-3 size-[15px] text-[#9296b0]" />

                    <Input
                      type="search"
                      value={searchValue}
                      onChange={(event) =>
                        setSearchValue(
                          event.target.value,
                        )
                      }
                      onKeyDown={
                        handleInputKeyDown
                      }
                      aria-label="Search admin records"
                    placeholder={
                        searchPlaceholder ??
                        selectedOption.placeholder
                      }
                      className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 pl-9 text-admin-14 text-[#15136f] shadow-none outline-none placeholder:text-[#9b9eb7] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                    type="button"
                    onClick={handleSearch}
                    aria-label="Search admin records"
                    disabled={
                      !searchValue.trim()
                    }
                    className="mr-1 h-9 min-w-0 sm:min-w-20.5 shrink-0 rounded-[6px] bg-[#2720a8] px-3 font-semibold text-admin-14 text-white shadow-none hover:bg-[#15136f] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Search data-icon="inline-start" />

                    <span className="hidden sm:inline">
                      Search
                    </span>
                  </Button>
                </div>

                {/* -------------------------------------------------
                    CUSTOM SEARCH TYPE DROPDOWN
                ------------------------------------------------- */}
                {dropdownOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-[9999] w-[190px] overflow-hidden rounded-[9px] border border-[#dedff0] bg-white p-1.5 shadow-[0_10px_30px_rgba(30,32,80,0.14)]">
                    <div className="px-2.5 pb-1.5 pt-1 text-admin-14 font-semibold uppercase tracking-[0.08em] text-[#9699b2]">
                      Search in
                    </div>

                    {searchOptions.map(
                      (option) => {
                        const Icon =
                          option.icon;

                        const isSelected =
                          option.value ===
                          searchType;

                        return (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            onClick={() =>
                              handleSearchTypeChange(
                                option.value,
                              )
                            }
                            className={`flex w-full items-center justify-between rounded-[7px] px-2.5 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-[#f1f0ff] text-[#2720a8]"
                                : "text-[#35385b] hover:bg-[#f7f7fb]"
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className={`flex h-[28px] w-[28px] items-center justify-center rounded-[6px] ${
                                  isSelected
                                    ? "bg-white"
                                    : "bg-[#f5f5fa]"
                                }`}
                              >
                                <Icon className="size-[15px]" />
                              </span>

                              <span className="text-admin-14 font-medium">
                                {
                                  option.label
                                }
                              </span>
                            </span>

                            {isSelected && (
                              <Check className="size-[14px] text-[#2720a8]" />
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* -------------------------------------------------
              RIGHT SIDE
          ------------------------------------------------- */}
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <DashboardUserMenu
              user={user}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
