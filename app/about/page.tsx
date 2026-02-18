import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping page
      </Link>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 text-blue-600 rounded-2xl p-3">
            <Info className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">About Us</h1>
        </div>

        <p className="text-slate-600 leading-relaxed font-medium">
          Welcome to our store. We focus on delivering high-quality products,
          fast order processing, and secure payments powered by Chapa.
        </p>

        <p className="text-slate-600 leading-relaxed font-medium mt-5">
          Our mission is simple: make shopping smooth, safe, and enjoyable.
        </p>
      </div>
    </div>
  );
}
