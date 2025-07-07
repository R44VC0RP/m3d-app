"use client";

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  gridClass: string;
  rotate?: string;
}

export function CustomerShowcase({ items }: { items: ShowcaseItem[] }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Customer Showcase</p>
            <h2 className="text-2xl font-medium tracking-tight text-foreground">
              Our favourite goodies ordered by our favourite people
            </h2>
          </div>

          <div className="mx-auto" style={{ width: "1024px", height: "550px" }}>
            <div
              className="grid grid-cols-4 grid-rows-3"
              style={{
                gap: "14px",
                gridColumnGap: "20px",
                gridTemplateColumns: "repeat(4, 241px)",
                gridTemplateRows: "repeat(3, 174px)",
                height: "100%",
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`${item.gridClass} relative overflow-hidden rounded-2xl group transition-all duration-300 hover:scale-105 shadow hover:shadow-xl hover:shadow-gray-400`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-all duration-300 scale-120 hover:scale-100 ${
                      item.rotate ? `rotate-${item.rotate}` : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
