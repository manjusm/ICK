import { prisma } from "@/lib/prisma";
import KitchenCard from "@/components/KitchenCard";

export const dynamic = "force-dynamic";

async function getKitchens() {
  return prisma.cloudKitchen.findMany({
    where: { isActive: true },
    include: { _count: { select: { menuItems: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function KitchensPage() {
  const kitchens = await getKitchens();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Indian Cloud Kitchens</h1>
        <p className="text-stone-500 mt-2">Explore authentic Indian cuisine from the best kitchens in Stockholm</p>
      </div>

      {kitchens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchens.map((k) => (
            <KitchenCard key={k.id} id={k.id} name={k.name} cuisine={k.cuisine}
              description={k.description} address={k.address} menuItemCount={k._count.menuItems} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">🍽️</span>
          <h3 className="text-xl font-semibold text-stone-600 mb-2">No kitchens available yet</h3>
          <p className="text-stone-400">Check back soon for new Indian cloud kitchens in Stockholm!</p>
        </div>
      )}
    </div>
  );
}
