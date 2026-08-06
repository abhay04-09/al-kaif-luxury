type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-4xl leading-tight text-porcelain sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-8 text-porcelain/70">{description}</p>
      ) : null}
    </div>
  );
}
