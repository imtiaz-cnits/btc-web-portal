import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // I'll create this next
import prisma from "@/lib/prisma";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mocked data for frontend preview
  const tenderNotices = [
    { id: "1", title: "বিটিসি ওয়েব পোর্টালে আপনাকে স্বাগতম - আমাদের নতুন ই-টেন্ডার সুবিধা গ্রহণ করুন।", createdAt: new Date() },
    { id: "2", title: "ইজিপি এবং টেন্ডার বিষয়ক সকল প্রকার সহযোগিতা পেতে আমাদের সাথে যোগাযোগ করুন।", createdAt: new Date() },
    { id: "3", title: "নতুন কনস্ট্রাকশন প্রজেক্টের টেন্ডার নোটিশ প্রকাশিত হয়েছে - বিস্তারিত জানতে ক্লিক করুন।", createdAt: new Date() },
  ];

  const notices = tenderNotices.map((notice) => ({
    id: notice.id,
    title: notice.title,
    link: `/egp-notice`,
  }));

  return (
    <div className="website-layout">
      <Navbar initialNotices={notices} />
      <main className="main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
