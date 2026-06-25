import type { Metadata } from "next";

const title = "My Monsters Docs – Field Reference | CRealizr";
const description =
  "Documentation for the My Monsters page: what each field means, how monsters integrate with other CRealizr tools, and import/export guidance.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "my monsters docs",
    "homebrew monster fields",
    "D&D 5e monster creator",
    "CRealizr monster reference",
  ],
  alternates: {
    canonical: "/my-monsters/docs",
  },
  openGraph: {
    title,
    description,
    url: "/my-monsters/docs",
    type: "website",
    siteName: "CRealizr",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function MyMonstersDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
