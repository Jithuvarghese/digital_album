"use client";

import { weddingConfig, type ModuleKey } from "@/config/wedding.config";
import { useSettings } from "@/data/hooks";
import { usePhase, useT } from "@/state/ui";
import { IntroGate } from "@/components/intro/intro-gate";
import { InvitationCard } from "./invitation-card";
import { CouplePortrait } from "./couple-portrait";
import { StoryTimeline } from "@/components/story/story-timeline";
import { ChatReveal } from "@/components/chat/chat-reveal";
import { Families } from "@/components/families/families";
import { Events } from "@/components/events/events";
import { Rituals } from "@/components/rituals/rituals";
import { BlessingRotator } from "@/components/blessings/blessing-rotator";
import { Hero, QuickActions } from "./hero";
import { VenueGuide } from "./venue-guide";
import { RsvpForm } from "./rsvp-form";
import { CapsuleTeaser, NowHappening, PhotoStrip, ThankYou } from "./phase-blocks";

export function HomePage() {
  const phase = usePhase();
  const t = useT();
  const enabled = useSettings((s) => s.settings.modulesEnabled);
  // A section is shown unless it has been switched off in the admin panel
  const m = Object.fromEntries(Object.keys(weddingConfig.modules).map((k) => [k, enabled[k as ModuleKey] !== false])) as Record<ModuleKey, boolean>;

  return (
    <>
      <IntroGate />
      <Hero />
      <QuickActions />
      <InvitationCard />
      <CouplePortrait />

      {phase === "before" && (
        <>
          {m.story && <StoryTimeline />}
          {m.chat && <ChatReveal />}
          {m.families && <Families />}
          {m.events && <Events />}
          {m.rituals && <Rituals />}
          {m.venue && <VenueGuide />}
          {m.rsvp && <RsvpForm />}
          {m.blessings && <BlessingRotator />}
        </>
      )}

      {phase === "during" && (
        <>
          <NowHappening />
          {m.gallery && <PhotoStrip title={t("gallery.guests")} sort="recent" />}
          {m.blessings && <BlessingRotator />}
          {m.events && <Events />}
          {m.rituals && <Rituals />}
          {m.families && <Families />}
          {m.venue && <VenueGuide />}
          {m.story && <StoryTimeline />}
        </>
      )}

      {phase === "after" && (
        <>
          <ThankYou />
          {m.gallery && <PhotoStrip title={t("gallery.favourites")} sort="likes" />}
          {m.capsule && <CapsuleTeaser />}
          {m.blessings && <BlessingRotator />}
          {m.story && <StoryTimeline />}
          {m.chat && <ChatReveal />}
          {m.families && <Families />}
        </>
      )}
    </>
  );
}
