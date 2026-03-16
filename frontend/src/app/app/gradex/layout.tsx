import { Metadata } from "next";
export const metadata: Metadata = {
  title: "GradeX",
  description: "GradeX CGPA Calculator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-full ">{children}</div>;
}

