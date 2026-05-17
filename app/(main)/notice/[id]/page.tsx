import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function SingleNoticePage({ params }: { params: { id: string } }) {
  // Mocked data for frontend preview
  const notice = {
    id: params.id,
    title: "Sample Notice Title",
    category: "LTM",
    content: "This is a sample notice content for frontend preview purposes.",
    publishDate: new Date(),
    lastDate: new Date(),
    createdBy: { name: "Admin" },
    filePath: null as string | null
  };
  /*
  const notice = await prisma.notice.findUnique({
    where: { id: params.id },
    include: { createdBy: { select: { name: true } } }
  });
  */

  if (!notice) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="custom-container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border">
          <div className="bg-[var(--primary-color)] p-8 text-white text-center">
            <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold uppercase mb-4 inline-block">
              {notice.category}
            </span>
            <h1 className="text-3xl font-bold uppercase leading-tight">{notice.title}</h1>
          </div>
          
          <div className="p-8 lg:p-12 space-y-8">
            <div className="flex flex-wrap gap-6 border-b pb-8">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-bold">Published Date</span>
                <span className="font-semibold">{notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-bold">Last Date of Submission</span>
                <span className="font-semibold text-red-500">{notice.lastDate ? new Date(notice.lastDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-bold">Author</span>
                <span className="font-semibold">{notice.createdBy.name}</span>
              </div>
            </div>

            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {notice.content}
            </div>

            {notice.filePath && (
              <div className="pt-10 border-t">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <svg className="w-6 h-6 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                   </svg>
                   Attached Document
                </h3>
                <div className="aspect-[4/5] md:aspect-video w-full bg-gray-100 rounded-2xl overflow-hidden border">
                  {notice.filePath.endsWith('.pdf') ? (
                    <iframe 
                      src={`${notice.filePath}#toolbar=0`} 
                      className="w-full h-full"
                      title="Notice Document"
                    ></iframe>
                  ) : (
                    <img 
                      src={notice.filePath} 
                      alt="Notice Attachment" 
                      className="w-full h-auto object-contain"
                    />
                  )}
                </div>
                <div className="mt-4 text-center">
                  <a 
                    href={notice.filePath} 
                    download 
                    target="_blank"
                    className="inline-flex items-center gap-2 text-[var(--primary-color)] font-bold hover:underline"
                  >
                    Download Original File
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
