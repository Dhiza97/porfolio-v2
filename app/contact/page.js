import { Reveal } from "@/app/components/portfolio/motion";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="frame-shell pb-12">

      <section className="grid grid-cols-1 border-b border-(--border) py-12 md:grid-cols-2 md:py-16">
        <Reveal className="border-b border-(--border) p-8 md:border-b-0 md:border-r md:p-10">
          <p className="label">Reach Out</p>
          <h1 className="mt-4 font-headline text-[clamp(2.8rem,6vw,5rem)] leading-[0.92]">
            Let&apos;s work together.
          </h1>
          <p className="mt-6 text-sm leading-8 text-(--text-sub)">
            Open to product engineering roles, contract work, and technical
            collaborations.
          </p>

          <div className="mt-8 grid gap-3">
            <a className="btn" href="mailto:hello@example.com">
              hello@example.com
            </a>
            <a className="btn" href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </Reveal>

        <Reveal className="p-8 md:p-10" delay={0.06}>
          <div className="card-soft p-5">
            <p className="label mb-4">Quick Message</p>
            <form className="grid gap-4" action="#" method="post">
              <input className="input" type="text" placeholder="Your name" />
              <input className="input" type="email" placeholder="Your email" />
              <textarea className="input" rows={6} placeholder="Tell me about your project" />
              <button className="btn" type="submit">
                Send Message
              </button>
            </form>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
