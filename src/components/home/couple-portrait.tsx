"use client";

import { motion } from "framer-motion";
import { weddingConfig } from "@/config/wedding.config";

export function CouplePortrait() {

  return (
    <section className="container-narrow px-4 pb-10">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto">
        {[
          { person: weddingConfig.bride, label: "The Bride", delay: 0 },
          { person: weddingConfig.groom, label: "The Groom", delay: 0.1 },
        ].map(({ person, label, delay }) => (
          <motion.div
            key={person.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            className="card overflow-hidden p-0"
          >
            <div className="relative aspect-[3/4] bg-gradient-to-br from-gold/10 to-maroon/5">
              <img
                src={person.photo}
                alt={person.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3 text-center">
              <p className="eyebrow text-[10px]">{label}</p>
              <p className="font-serif text-lg text-maroon">{person.name}</p>
              {person.nickname && (
                <p className="text-xs italic text-muted">&ldquo;{person.nickname}&rdquo;</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
