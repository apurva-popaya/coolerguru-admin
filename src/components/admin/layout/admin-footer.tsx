import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

import { WideContainer } from "@/components/common/wide-container";

const buyerLinks = [
  {
    label: "Search Companies",
    href: "https://coolerguru.com/companies",
  },
  {
    label: "Search Products",
    href: "https://coolerguru.com/products",
  },
  {
    label: "By Location",
    href: "https://coolerguru.com/companies?city=all",
  },
  {
    label: "New Launches",
    href: "https://coolerguru.com/new-launches",
  },
  {
    label: "Blog",
    href: "https://coolerguru.com/blog",
  },
];

const supplierLinks = [
  {
    label: "List Your Company",
    href: "https://coolerguru.com/list-your-company",
  },
  {
    label: "Add Products",
    href: "https://coolerguru.com/supplier/dashboard/products/add",
  },
  {
    label: "Supplier Dashboard",
    href: "https://coolerguru.com/supplier/dashboard",
  },
  {
    label: "Supplier Benefits",
    href: "https://coolerguru.com/supplier-benefits",
  },
];

const companyLinks = [
  {
    label: "About Us",
    href: "https://coolerguru.com/about-us",
  },
  {
    label: "Why CoolerGuru",
    href: "https://coolerguru.com/why-coolerguru",
  },
  {
    label: "How It Works",
    href: "https://coolerguru.com/how-it-works",
  },
  // {
  //   label: "Terms & Conditions",
  //   href: "https://coolerguru.com/terms-and-conditions",
  // },
  // {
  //   label: "Privacy Policy",
  //   href: "https://coolerguru.com/privacy-policy",
  // },
  {
    label: "Contact Us",
    href: "https://coolerguru.com/contact-us",
  },
];

const resourceLinks = [
  {
    label: "Buying Guide",
    href: "https://coolerguru.com/buying-guide",
  },
  {
    label: "Industry Insights",
    href: "https://coolerguru.com/industry-insights",
  },
  {
    label: "Articles",
    href: "https://coolerguru.com/articles",
  },
  {
    label: "FAQs",
    href: "https://coolerguru.com/faqs",
  },
];

export function AdminFooter() {
  return (
    <WideContainer>
      <footer className="w-full overflow-hidden bg-[#07194d] px-marketplace-4 py-marketplace-7 text-primary-foreground sm:px-marketplace-8 sm:py-marketplace-8 lg:px-marketplace-10">
        <div
          className="
            mx-auto w-full max-w-[1600px]
            grid grid-cols-1 gap-7
            sm:grid-cols-2
            lg:grid-cols-6
            xl:grid-cols-[1.35fr_1fr_1fr_1fr_1fr_1.2fr]
            xl:gap-7
          "
        >
          {/* BRAND */}
          <div className="min-w-0">
            <Link href="https://coolerguru.com/">
              <Image
                src="/images/logo/logo-light1.png"
                alt="CoolerGuru"
                width={175}
                height={55}
                className="h-auto w-[140px] brightness-0 invert sm:w-[150px]"
              />
            </Link>

            <p className="mt-3 max-w-[220px] text-marketplace-10 leading-[1.55] text-primary-foreground/80 sm:text-marketplace-10">
              India&apos;s most comprehensive directory for air cooler
              manufacturers, OEMs, suppliers &amp; exporters.
            </p>

            <div className="mt-4 flex items-center gap-2.5">
              <SocialIcon href="#" label="Facebook">
                <FaFacebookF size={13} />
              </SocialIcon>

              <SocialIcon href="#" label="LinkedIn">
                <FaLinkedinIn size={13} />
              </SocialIcon>

              <SocialIcon href="#" label="YouTube">
                <FaYoutube size={14} />
              </SocialIcon>

              <SocialIcon href="#" label="Instagram">
                <FaInstagram size={14} />
              </SocialIcon>
            </div>
          </div>

          {/* BUYERS */}
          <div className="min-w-0">
            <FooterColumn title="For Buyers" links={buyerLinks} />
          </div>

          {/* SUPPLIERS */}
          <div className="min-w-0">
            <FooterColumn title="For Suppliers" links={supplierLinks} />
          </div>

          {/* COMPANY */}
          <div className="min-w-0">
            <FooterColumn title="Company" links={companyLinks} />
          </div>

          {/* RESOURCES */}
          <div className="min-w-0">
            <FooterColumn title="Resources" links={resourceLinks} />
          </div>

          {/* CONTACT */}
          {/* CONTACT */}
<div className="min-w-0">
  <h3 className="font-bold text-marketplace-13 text-primary-foreground">
    Contact Us
  </h3>

  <div className="mt-5 flex flex-col gap-4">
    <a
      href="tel:+919876543210"
      className="block"
    >
      <ContactItem
        icon={<Phone size={16} />}
        text="+91 98765 43210"
      />
    </a>

    <a
      href="mailto:support@coolerguru.com"
      className="block"
    >
      <ContactItem
        icon={<Mail size={16} />}
        text="support@coolerguru.com"
      />
    </a>

    <ContactItem
      icon={<MapPin size={16} />}
      text="Ahmedabad, Gujarat, India"
    />

    <ContactItem
      icon={<Clock3 size={16} />}
      text="Mon - Sat: 10:00 AM - 6:00 PM"
    />

    {/* <p className="pl-[27px] pt-1 text-marketplace-10 leading-[1.4] text-primary-foreground/75">
      GST: 24AABCC1234D1Z5
    </p> */}
  </div>
</div>
        </div>

        {/* BOTTOM */}
        <div className="mx-auto mt-8 w-full max-w-[1600px] border-t border-white/15 pt-4">
          <div
            className="
              flex flex-col gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p className="text-marketplace-10 leading-[1.5] text-primary-foreground/65">
              © {new Date().getFullYear()} CoolerGuru.com Pvt. Ltd.
              All Rights Reserved.
            </p>

            <div
              className="
                flex flex-wrap items-center
                gap-x-3 gap-y-2
                text-marketplace-10 text-primary-foreground/70
                sm:justify-end
              "
            >
              {/* <Link
                href="#"
                className="transition hover:text-primary-foreground"
              >
                Sitemap
              </Link> */}

              {/* <span className="text-primary-foreground/25">|</span> */}

              <Link
                href="https://coolerguru.com/disclaimer"
                className="transition hover:text-primary-foreground"
              >
                Disclaimer
              </Link>

              <span className="text-primary-foreground/25">|</span>

              <Link
                href="https://coolerguru.com/privacy-policy"
                className="transition hover:text-primary-foreground"
              >
                Privacy Policy
              </Link>

              <span className="text-primary-foreground/25">|</span>

              <Link
                href="https://coolerguru.com/terms-and-conditions"
                className="transition hover:text-primary-foreground"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </WideContainer>
  );
}

interface FooterColumnProps {
  title: string;

  links: {
    label: string;
    href: string;
  }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-bold text-marketplace-12 text-primary-foreground">
        {title}
      </h3>

      <div className="mt-4 flex flex-col gap-[9px]">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-marketplace-10 leading-[1.35] text-primary-foreground/75 transition hover:text-primary-foreground sm:text-marketplace-10"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

interface SocialIconProps {
  href: string;
  label: string;
  children: ReactNode;
}

function SocialIcon({
  href,
  label,
  children,
}: SocialIconProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-white/20 text-primary-foreground transition hover:bg-card/10"
    >
      {children}
    </Link>
  );
}

interface ContactItemProps {
  icon: ReactNode;
  text: string;
}

function ContactItem({
  icon,
  text,
}: ContactItemProps) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 text-marketplace-10 leading-[1.4] text-primary-foreground/80 sm:text-marketplace-10">
      <span className="mt-px shrink-0 text-primary-foreground/90">
        {icon}
      </span>

      <span className="min-w-0 break-words">
        {text}
      </span>
    </div>
  );
}
