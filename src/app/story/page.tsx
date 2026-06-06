import SectionTitle from "@/components/SectionTitle";
import Timeline, { type TimelineChapter } from "@/components/Timeline";

const chapters: TimelineChapter[] = [
  {
    year: "The beginning",
    title: "Early Life",
    text: "Rajesh grew up surrounded by warmth and laughter, the kind of childhood that shapes a gentle, generous heart. Even as a boy he had a way of making everyone around him feel they belonged.",
    hasImage: true,
  },
  {
    year: "His own family",
    title: "Family",
    text: "When he built his own family, he poured everything into it. Sunday meals, long stories, and an open door for anyone who needed one — home was wherever Rajesh was.",
    hasImage: true,
  },
  {
    year: "Being a dad",
    title: "Fatherhood",
    text: "To Vik and Bhavik, he was steady, patient, and endlessly proud. He taught by example: work hard, stay humble, and never let a chance to laugh together pass you by.",
    hasImage: true,
  },
  {
    year: "What he stood for",
    title: "Work & Values",
    text: "He believed in doing things properly and treating everyone with respect. Colleagues remember a man who led quietly, helped freely, and always kept his word.",
    hasImage: false,
  },
  {
    year: "Forever",
    title: "Moments We'll Always Remember",
    text: "The chai on the porch. The terrible-wonderful jokes. The way he made ordinary days feel like a gift. These are the moments that keep his light alive in all of us.",
    hasImage: true,
  },
];

export default function StoryPage() {
  return (
    <div className="bg-warm-glow">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="His Story"
          title="The life of Rajesh"
          subtitle="A few chapters from a life filled with love, laughter, and quiet kindness. Add your own photos and words to keep telling his story."
        />
        <div className="mt-14">
          <Timeline chapters={chapters} />
        </div>
      </section>
    </div>
  );
}
