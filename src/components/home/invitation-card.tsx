"use client";

import { motion } from "framer-motion";
import { weddingConfig } from "@/config/wedding.config";
import { Jasmine } from "@/components/ui/ornaments";

export function InvitationCard() {
  return (
    <section className="container-narrow px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="kasavu-frame relative mx-auto max-w-md rounded-[28px] bg-paper px-8 py-10 text-center shadow-card"
      >
        <div className="kasavu-line w-full" />
        <Jasmine size={20} className="mx-auto mt-6 text-gold" />
        <p className="eyebrow mt-5">A Family Invitation</p>

        <p className="mx-auto mt-5 max-w-xs font-serif text-lg italic leading-relaxed text-ink/85">
          &ldquo;With hearts full of joy, we invite you and your family to be a part of the wedding celebration of our beloved children.&rdquo;
        </p>

        <div className="kasadu-line my-6 w-16 border-t border-gold/40 mx-auto" />

        <p className="text-sm font-semibold uppercase tracking-widest text-muted">With love from</p>

        <div className="mt-5 grid grid-cols-2 gap-6">
          <div>
            <p className="font-serif text-base leading-snug text-maroon">
              {weddingConfig.families.bride[0]?.name ?? "The Bride's Family"}
            </p>
            <p className="mt-0.5 text-xs text-muted">Bride&apos;s Family · Kochi</p>
          </div>
          <div>
            <p className="font-serif text-base leading-snug text-maroon">
              {weddingConfig.families.groom[0]?.name ?? "The Groom's Family"}
            </p>
            <p className="mt-0.5 text-xs text-muted">Groom&apos;s Family · Coimbatore</p>
          </div>
        </div>

        <div className="kasavu-line mt-8 w-full" />
      </motion.div>
    </section>
  );
}
