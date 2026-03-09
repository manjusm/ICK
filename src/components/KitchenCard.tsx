import Link from "next/link";

type Props = {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  address: string;
  menuItemCount: number;
};

export default function KitchenCard({ id, name, cuisine, description, address, menuItemCount }: Props) {
  return (
    <Link href={`/kitchens/${id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🍛</span>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-stone-800 group-hover:text-amber-600 transition-colors">{name}</h3>
          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">{cuisine}</span>
        </div>
        <p className="text-stone-500 text-sm mt-2 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-stone-400 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{address}</span>
          </div>
          <span className="text-stone-400 text-sm">{menuItemCount} items</span>
        </div>
      </div>
    </Link>
  );
}
