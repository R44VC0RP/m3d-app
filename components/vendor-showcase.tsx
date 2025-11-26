export default function VendorShowcase() {
  return (
    <section className="w-full py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-muted-foreground">Trusted By</p>
            <h2 className="text-2xl font-medium tracking-tight text-foreground">
              Our A+ Vendors
            </h2>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-8 md:grid-cols-4">
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2">
              <img
                src="/vendors/vercel.png"
                alt="Vendor 1"
                className="h-[24px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2">
              <img
                src="/vendors/uploadthing.png"
                alt="Vendor 1"
                className="h-[28px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2">
              <img
                src="/vendors/ping.png"
                alt="Vendor 1"
                className="h-[36px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2">
              <img
                src="/vendors/t3chat.png"
                alt="Vendor 1"
                className="h-[22px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2">
              <img
                src="/vendors/0emailicon.png"
                alt="Vendor 1"
                className="h-[24px]"
              />
              <img
                src="/vendors/0email.png"
                alt="Vendor 1"
                className="h-[20px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center  gap-2">
              <img
                src="/vendors/betterauthicon.png"
                alt="Vendor 1"
                className="h-[24px]"
              />
              <img
                src="/vendors/betterauth.png"
                alt="Vendor 1"
                className="h-[18px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2">
              <img
                src="/vendors/mintlify.png"
                alt="Vendor 1"
                className="h-[30px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2">
              <img
                src="/vendors/neon-sign.png"
                alt="Vendor 1"
                className="h-[50px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
