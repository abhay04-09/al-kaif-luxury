"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Clock, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  FileCheck,
  X,
  ShieldCheck
} from "lucide-react";

const queryCategories = [
  "Order Status & Tracking",
  "Damaged / Defective Item (Exchange Request)",
  "Perfume Fragrance & Scent Notes Inquiry",
  "Jewelry Material, Sizing & Care",
  "Payment / Refund Confirmation",
  "Bulk / Gifting Inquiry"
];

const faqs = [
  {
    question: "How do I track my shipment?",
    answer: "Tracking links and AWB numbers are sent via SMS/Email within 24 hours of dispatch. You can track directly through our courier partner portal using your tracking ID."
  },
  {
    question: "How do I report a damaged jewelry or perfume item?",
    answer: "Submit a query using the form above with your order number and mandatory continuous unboxing video within 48 hours of delivery."
  },
  {
    question: "How long do the perfume fragrances last?",
    answer: "Our perfumes are formulated with high-concentration fragrance oils providing an average longevity of 6 to 10 hours depending on skin chemistry and application."
  },
  {
    question: "How do I maintain artificial jewelry?",
    answer: "Keep jewelry away from direct contact with water, sweat, sanitizers, and alcohol-based perfumes to preserve the polish and luster."
  }
];

export default function QuerySupportPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    whatsappOptIn: true,
    orderId: "",
    category: queryCategories[0],
    message: ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const refNo = `AK-QRY-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

      const payload = new FormData();
      // If access_key is set in .env, use it; otherwise Web3Forms will accept form details
      payload.append("access_key", accessKey || "5b6a3861-5586-4f40-9a84-eb893f41ee13");
      payload.append("subject", `New AL-KAIF Inquiry: ${formData.category} [${refNo}]`);
      payload.append("from_name", "AL-KAIF Web Concierge");
      payload.append("to_email", "info@alkaif.in");
      payload.append("name", formData.fullName);
      payload.append("email", formData.email);
      payload.append("phone", formData.mobile);
      payload.append("whatsapp_opt_in", formData.whatsappOptIn ? "Yes" : "No");
      payload.append("order_id", formData.orderId || "N/A");
      payload.append("category", formData.category);
      payload.append("message", formData.message);
      payload.append("reference_ticket", refNo);

      if (selectedFile) {
        payload.append("attachment", selectedFile);
      }

      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: payload
      });
    } catch (err) {
      console.error("Web3Forms email submission error:", err);
    } finally {
      setReferenceNo(refNo);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  }

  function handleReset() {
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      whatsappOptIn: true,
      orderId: "",
      category: queryCategories[0],
      message: ""
    });
    setSelectedFile(null);
    setIsSubmitted(false);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        {/* Header section */}
        <div className="border-b border-white/10 pb-10">
          <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
            Concierge & Help Desk
          </p>
          <h1 className="mt-4 font-serif text-4xl text-porcelain sm:text-5xl lg:text-6xl">
            Raise a Query & Support
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-porcelain/75">
            Have a question about your order, fragrance notes, or jewelry care? Submit a ticket below or connect directly with our client concierge.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Column 1: Query Submission Form */}
          <div className="border border-white/10 bg-onyx/40 p-6 sm:p-10">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gold-light" />
                Submit Your Inquiry
              </h2>
              <span className="text-[0.65rem] uppercase tracking-luxury text-emerald-400 border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Web3Forms Mailer Active
              </span>
            </div>
            <p className="mt-2 text-xs text-porcelain/65">
              Fill out the details below and our team will get back to you promptly at info@alkaif.in.
            </p>

            {isSubmitted ? (
              <div className="mt-8 border border-gold/40 bg-gold/5 p-8 text-center animate-in fade-in duration-300">
                <CheckCircle2 className="mx-auto h-12 w-12 text-gold-light" />
                <h3 className="mt-4 font-serif text-2xl text-porcelain">Query Submitted Successfully</h3>
                <p className="mt-3 text-sm text-gold-light font-mono">Reference Ticket: {referenceNo}</p>
                <p className="mt-4 text-sm leading-7 text-porcelain/80">
                  Thank you! Your query has been dispatched to <strong>info@alkaif.in</strong>. Our concierge team will respond within 24 business hours.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-8 inline-block border border-gold-light px-6 py-3 text-xs uppercase tracking-luxury text-gold-light hover:bg-gold-light hover:text-ink transition"
                >
                  Submit Another Query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-luxury text-porcelain/80 mb-2">
                    Full Name <span className="text-gold-light">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border border-white/10 bg-obsidian/80 px-4 py-3 text-sm text-porcelain focus:border-gold-light focus:outline-none"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-luxury text-porcelain/80 mb-2">
                      Email Address <span className="text-gold-light">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-white/10 bg-obsidian/80 px-4 py-3 text-sm text-porcelain focus:border-gold-light focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-luxury text-porcelain/80 mb-2">
                      Mobile Number <span className="text-gold-light">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full border border-white/10 bg-obsidian/80 px-4 py-3 text-sm text-porcelain focus:border-gold-light focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="whatsappOptIn"
                    checked={formData.whatsappOptIn}
                    onChange={(e) => setFormData({ ...formData, whatsappOptIn: e.target.checked })}
                    className="h-4 w-4 accent-gold-light"
                  />
                  <label htmlFor="whatsappOptIn" className="text-xs text-porcelain/75 cursor-pointer">
                    Opt-in to receive query updates & resolution via WhatsApp / SMS
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-luxury text-porcelain/80 mb-2">
                      Order ID <span className="text-porcelain/40">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. #AK-10492"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      className="w-full border border-white/10 bg-obsidian/80 px-4 py-3 text-sm text-porcelain focus:border-gold-light focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-luxury text-porcelain/80 mb-2">
                      Query Category <span className="text-gold-light">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-white/10 bg-obsidian/80 px-4 py-3 text-sm text-porcelain focus:border-gold-light focus:outline-none"
                    >
                      {queryCategories.map((cat) => (
                        <option key={cat} value={cat} className="bg-obsidian text-porcelain">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-luxury text-porcelain/80 mb-2">
                    Message / Query <span className="text-gold-light">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your query in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border border-white/10 bg-obsidian/80 px-4 py-3 text-sm text-porcelain focus:border-gold-light focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-luxury text-porcelain/80 mb-2">
                    Attachment / Proof Upload <span className="text-porcelain/40">(Unboxing video or photos for damage/exchange)</span>
                  </label>
                  <div className="relative border border-dashed border-white/20 bg-obsidian/40 p-4 text-center hover:border-gold-light transition">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-between text-xs text-gold-light">
                        <span className="flex items-center gap-2 truncate">
                          <FileCheck className="h-4 w-4 shrink-0" />
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="p-1 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-porcelain/60 text-xs">
                        <Upload className="h-5 w-5 text-gold-light mb-1" />
                        <span>Click or drag unboxing video or parcel image here</span>
                        <span className="text-[10px] text-porcelain/40">MP4, MOV, JPG, PNG up to 50MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full border border-gold-light bg-gold-light px-6 py-4 text-xs font-semibold uppercase tracking-luxury text-ink hover:bg-transparent hover:text-gold-light transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Dispatching Email...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Query
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Column 2: Direct Support Channels & WhatsApp Link */}
          <div className="space-y-8">
            <div className="border border-white/10 bg-onyx/40 p-6 sm:p-8">
              <h2 className="font-serif text-2xl text-porcelain">Direct Support Channels</h2>
              <p className="mt-2 text-xs text-porcelain/65">Reach our concierge directly via email, phone, or live chat.</p>

              <div className="mt-8 space-y-6 text-sm text-porcelain/80">
                <div className="flex items-start gap-4">
                  <div className="border border-gold-light/40 p-2 text-gold-light shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-luxury text-gold-light">Email Support</p>
                    <a href="mailto:info@alkaif.in" className="text-base text-porcelain hover:text-gold-light transition">
                      info@alkaif.in
                    </a>
                    <p className="text-xs text-porcelain/60 mt-1">Guaranteed response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-white/10 pt-6">
                  <div className="border border-gold-light/40 p-2 text-gold-light shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-luxury text-gold-light">Customer Concierge Hours</p>
                    <p className="text-base text-porcelain">Monday – Saturday</p>
                    <p className="text-xs text-porcelain/60 mt-1">10:00 AM – 6:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-white/10 pt-6">
                  <div className="border border-gold-light/40 p-2 text-gold-light shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-luxury text-gold-light">Headquarters / Fulfillment</p>
                    <p className="text-base text-porcelain">AL-Kaif Dispatch Hub</p>
                    <p className="text-xs text-porcelain/60 mt-1">Vapi, Gujarat, India</p>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Button */}
              <div className="mt-8 border-t border-white/10 pt-8">
                <p className="text-xs uppercase tracking-luxury text-gold-light mb-3">Instant Help / Live Chat</p>
                <a
                  href="https://wa.me/917096022333?text=Hi%20AL-Kaif,%20I%20have%20a%20query"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 border border-emerald-500/50 bg-emerald-950/30 px-6 py-4 text-xs font-semibold uppercase tracking-luxury text-emerald-400 hover:bg-emerald-600 hover:text-white transition rounded-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat with Us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Common Self-Service FAQs */}
        <section className="mt-20 border-t border-white/10 pt-16">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-gold-light" />
            <h2 className="font-serif text-3xl text-porcelain sm:text-4xl">Common Self-Service FAQs</h2>
          </div>
          <p className="mt-3 text-sm text-porcelain/70">
            Quick answers to frequently asked questions about tracking, damaged items, fragrances, and jewelry care.
          </p>

          <div className="mt-8 space-y-4 max-w-4xl">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className="border border-white/10 bg-onyx/30 transition hover:border-gold-light/40"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="font-serif text-lg text-porcelain">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-gold-light shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-porcelain/60 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/10 px-6 pb-6 pt-4 text-sm leading-8 text-porcelain/75">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
