import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getFeaturedKitchens() {
  return prisma.cloudKitchen.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

export default async function HomePage() {
  const kitchens = await getFeaturedKitchens();

  return (
    <div>
      <section className="relative bg-gradient-to-br from-amber-600 via-orange-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Authentic Indian Food<br />
              <span className="text-amber-200">Delivered in Stockholm</span>
            </h1>
            <p className="text-lg md:text-xl text-amber-100 mb-8 max-w-2xl">
              Discover the best Indian cloud kitchens in Stockholm. From aromatic biryanis to creamy curries, your favorite Indian dishes are just a click away.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/kitchens" className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-3 rounded-lg font-bold text-lg transition-colors">Browse Kitchens</Link>
              <Link href="/auth/register" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-bold text-lg transition-colors">Register Your Kitchen</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-800 mb-3">Our Cloud Kitchens</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">Handpicked Indian cloud kitchens serving authentic flavors from across India</p>
        </div>

        {kitchens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kitchens.map((k) => (
              <Link key={k.id} href={`/kitchens/${k.id}`} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <span className="text-6xl">🍛</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-stone-800 group-hover:text-amber-600 transition-colors">{k.name}</h3>
                  <p className="text-amber-600 text-sm font-medium mt-1">{k.cuisine}</p>
                  <p className="text-stone-500 text-sm mt-2 line-clamp-2">{k.description}</p>
                  <div className="flex items-center gap-2 mt-4 text-stone-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {k.address}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🍽️</span>
            <h3 className="text-xl font-semibold text-stone-600 mb-2">No kitchens yet</h3>
            <p className="text-stone-400 mb-6">Be the first to register your Indian cloud kitchen in Stockholm!</p>
            <Link href="/auth/register" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">Register Your Kitchen</Link>
          </div>
        )}

        {kitchens.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/kitchens" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">View All Kitchens</Link>
          </div>
        )}
      </section>

      <section className="bg-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">Multiple Kitchens</h3>
              <p className="text-stone-500 text-sm">Choose from a variety of Indian cloud kitchens, each with their unique specialties and flavors.</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">Secure Payments</h3>
              <p className="text-stone-500 text-sm">Pay securely with Stripe. Your payment information is always protected.</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">Rate &amp; Review</h3>
              <p className="text-stone-500 text-sm">Share your experience by rating dishes. Help others find the best Indian food in Stockholm.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
