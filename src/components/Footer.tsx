import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MotherflameLogo } from './MotherflameLogo';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe.');
      }

      toast.success(data.message || 'Successfully subscribed!');
      setIsSubscribed(true);
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="main-footer" className="bg-white border-t border-slate-200/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
          {/* Brand & Description Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center">
              <MotherflameLogo size={42} showText={true} textClassName="text-slate-900" />
            </div>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Experience the future of premium curated storefronts. Handpicked, sustainably sourced, and meticulously crafted designs delivered directly to you.
            </p>
          </div>

          {/* Newsletter Subscription Column */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Join Our Newsletter
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Subscribe to receive weekly curated inspirations, product releases, and exclusive design-centric discounts.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 max-w-md">
                <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                <span className="text-xs font-semibold">
                  You are subscribed! Thank you for joining our community.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative flex items-center max-w-md">
                <div className="absolute left-3 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="newsletter-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-3 pl-10 pr-24 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                  required
                />
                <button
                  id="newsletter-submit-button"
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="absolute right-1.5 bg-slate-900 text-white hover:bg-blue-600 disabled:bg-slate-300 disabled:text-slate-500 rounded-lg px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Bottom copyright and payment indicators */}
        <div className="pt-8 text-center text-xs text-slate-400 font-medium space-y-2">
          <p>© 2026 Motherflame Inc. Crafted with pure focus on modern, sustainable, and minimalist designs.</p>
          <p className="font-mono text-[10px] text-slate-400/80 tracking-widest font-bold">
            VERIFIED SECURE PAYMENT PLATFORM • SSL SECURED BY AIVEN
          </p>
        </div>
      </div>
    </footer>
  );
}
