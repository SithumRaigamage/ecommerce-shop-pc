export default function ComingSoon() {
  return (
    <section className="flex items-center py-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex flex-col justify-center py-12 md:col-span-5">
          <h1 className="mb-6 text-3xl leading-none font-bold md:text-5xl">
            This Page is Coming Soon!
          </h1>
          <p className="text-muted-foreground text-lg">
            We&apos;re still putting this one together. Check back soon — in the meantime, browse
            our latest components and pre-built rigs.
          </p>
        </div>
        <div className="md:col-span-7">
          <img
            src="https://cdn.easyfrontend.com/pictures/comingsoon/six.jpg"
            alt=""
            className="hidden min-h-[350px] w-full rounded-2xl object-cover md:block"
          />
        </div>
      </div>
    </section>
  )
}
