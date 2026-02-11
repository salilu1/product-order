import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping
      </Link>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm">
        <h1 className="text-4xl font-black text-slate-900 mb-6">
          Contact Us
        </h1>

        <p className="text-slate-600 leading-relaxed font-medium mb-8">
          Need help with an order or have a question? Reach out anytime.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <Mail className="w-5 h-5 text-blue-600" />
            support@example.com
          </div>

          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <Phone className="w-5 h-5 text-blue-600" />
            +251 900 000 000
          </div>

          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <MapPin className="w-5 h-5 text-blue-600" />
            Addis Ababa, Ethiopia
          </div>
        </div>
      </div>
    </div>
  );
}
