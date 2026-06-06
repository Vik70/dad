import SectionTitle from "@/components/SectionTitle";
import MemoryForm from "@/components/MemoryForm";

export default function SharePage() {
  return (
    <div className="bg-warm-glow">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="Share a Memory"
          title="Share a photo or a memory"
          subtitle="Add a favourite photo of Rajesh, a few words, or both — everything is optional. Your memory will appear on the wall once it's been approved."
        />
        <div className="mt-12">
          <MemoryForm />
        </div>
      </section>
    </div>
  );
}
