import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCartButton";
import RatingStars from "@/components/RatingStars";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  STARTER: "Starters", MAIN: "Main Course", DESSERT: "Desserts", BEVERAGE: "Beverages",
};

export default async function KitchenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kitchen = await prisma.cloudKitchen.findUnique({
    where: { id, isActive: true },
    include: {
      owner: { select: { name: true } },
      menuItems: {
        where: { isAvailable: true },
        include: { ratings: { select: { score: true } } },
        orderBy: { category: "asc" },
      },
    },
  });
  if (!kitchen) notFound();

  const menuByCategory = kitchen.menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof kitchen.menuItems>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 md:p-12 text-white mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{kitchen.name}</h1>
        <p className="text-amber-100 text-lg mb-4">{kitchen.cuisine}</p>
        <p className="text-amber-50 max-w-2xl">{kitchen.description}</p>
        <div className="flex flex-wrap gap-6 mt-6 text-amber-100 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {kitchen.address}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {kitchen.phone}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-stone-800 mb-6">Menu</h2>

      {Object.keys(menuByCategory).length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <span className="text-4xl block mb-2">📋</span>No menu items available yet
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(menuByCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold text-stone-700 mb-4 border-b border-stone-200 pb-2">
                {categoryLabels[category] || category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const avg = item.ratings.length > 0
                    ? item.ratings.reduce((s, r) => s + r.score, 0) / item.ratings.length : 0;
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-stone-800">{item.name}</h4>
                        <p className="text-stone-500 text-sm mt-1">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-amber-600 font-bold">{formatPrice(item.price)}</span>
                          {avg > 0 && (
                            <div className="flex items-center gap-1">
                              <RatingStars rating={avg} size="sm" />
                              <span className="text-stone-400 text-xs">({item.ratings.length})</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <AddToCartButton menuItemId={item.id} name={item.name} price={item.price}
                        kitchenId={kitchen.id} kitchenName={kitchen.name} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
