interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  quote: string
  imageUrl?: string
}

interface TrustedPeopleProps {
  testimonials: Testimonial[]
}

export function TrustedPeople({ testimonials }: TrustedPeopleProps) {
  return (
    <section className="w-full py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-medium tracking-tight text-foreground">Trusted by people</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-foreground">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} @ {testimonial.company}
                  </p>
                </div>
                <p className="text-muted-foreground text-sm">"{testimonial.quote}"</p>
                {testimonial.imageUrl && (
                  <div className="mt-4 aspect-video w-full bg-muted rounded-lg overflow-hidden">
                    <img
                      src={testimonial.imageUrl}
                      alt={`${testimonial.name}'s project`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 