import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Course",
  description: "Academic Course data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-full ">{children}</div>;
}
 
