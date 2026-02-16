import { motion } from 'framer-motion';
import HeroCopy from '../components/home/HeroCopy';
import LivePreviewCard from '../components/home/LivePreviewCard';
import FeaturesGrid from '../components/home/FeaturesGrid';
import HowItWorksSection from '../components/home/HowItWorksSection';
import OutcomesSection from '../components/home/OutcomesSection';
import {
  containerVariants,
  features,
  howItWorksSteps,
  itemVariants,
  outcomes,
} from '../components/home/homeContent';

const MotionSection = motion.section;
const MotionDiv = motion.div;

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <MotionDiv className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/25 blur-3xl" />
      <MotionDiv className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

      <MotionSection
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-6xl px-6 py-16 md:py-24"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <MotionDiv variants={itemVariants}>
            <HeroCopy />
          </MotionDiv>

          <MotionDiv variants={itemVariants}>
            <LivePreviewCard />
          </MotionDiv>
        </div>

        <MotionDiv variants={itemVariants}>
          <FeaturesGrid features={features} />
        </MotionDiv>
      </MotionSection>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <HowItWorksSection steps={howItWorksSteps} />
        <OutcomesSection outcomes={outcomes} />
      </section>
    </div>
  );
}
