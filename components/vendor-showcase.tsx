export default function VendorShowcase() {
  return (
    <section className="w-full py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">Trusted By</p>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground">
              Our A+ Vendors
            </h2>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-8 md:grid-cols-4">
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2 py-3 sm:py-0">
              <img
                src="/vendors/vercel.png"
                alt="Vercel"
                className="h-[18px] sm:h-[24px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2 py-3 sm:py-0">
              <img
                src="/vendors/uploadthing.png"
                alt="UploadThing"
                className="h-[22px] sm:h-[28px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2 py-3 sm:py-0">
              <img
                src="/vendors/ping.png"
                alt="Ping"
                className="h-[28px] sm:h-[36px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2 py-3 sm:py-0">
              <img
                src="/vendors/t3chat.png"
                alt="T3 Chat"
                className="h-[18px] sm:h-[22px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-0">
              <img
                src="/vendors/0emailicon.png"
                alt="0Email Icon"
                className="h-[18px] sm:h-[24px]"
              />
              <img
                src="/vendors/0email.png"
                alt="0Email"
                className="h-[16px] sm:h-[20px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-0">
              <img
                src="/vendors/betterauthicon.png"
                alt="Better Auth Icon"
                className="h-[18px] sm:h-[24px]"
              />
              <img
                src="/vendors/betterauth.png"
                alt="Better Auth"
                className="h-[14px] sm:h-[18px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2 py-3 sm:py-0">
              <img
                src="/vendors/mintlify.png"
                alt="Mintlify"
                className="h-[24px] sm:h-[30px]"
              />
            </div>
            <div className="col-span-1 row-span-1 flex items-center justify-center gap-2 py-3 sm:py-0">
              <img
                src="/vendors/neon-sign.png"
                alt="Neon"
                className="h-[40px] sm:h-[50px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
