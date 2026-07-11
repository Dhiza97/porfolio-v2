import { Reveal } from "@/app/components/portfolio/motion";

export const metadata = {
  title: "Contact",
};

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const status = params?.status;

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
            <a className="btn" href="mailto:the.josephgarba@gmail.com">
              the.josephgarba@gmail.com
            </a>
            <a className="btn" href="https://github.com/dhiza97" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn" href="https://www.linkedin.com/in/joseph-garba-70b34914a" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </Reveal>

        <Reveal className="p-8 md:p-10" delay={0.06}>
          <div className="card-soft p-5">
            <p className="label mb-4">Quick Message</p>
            {status === "sent" && (
              <p className="mb-4 text-sm text-(--text-sub)">
                Message sent successfully. I will get back to you shortly.
              </p>
            )}
            {status === "error" && (
              <p className="mb-4 text-sm text-(--text-sub)">
                Message failed to send. Please retry or use the email button.
              </p>
            )}
            <form className="grid gap-4" action="/api/contact" method="post">
              <input className="input" name="name" type="text" placeholder="Your name" required />
              <input className="input" name="email" type="email" placeholder="Your email" required />
              <textarea className="input" name="message" rows={6} placeholder="Tell me about your project" required />
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