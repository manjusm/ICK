export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">ICK Stockholm</h3>
            <p className="text-sm">Your gateway to authentic Indian cloud kitchens in Stockholm.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/kitchens" className="hover:text-amber-400">Browse Kitchens</a></li>
              <li><a href="/auth/register" className="hover:text-amber-400">Register Your Kitchen</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Contact</h4>
            <p className="text-sm">Stockholm, Sweden</p>
            <p className="text-sm">info@ickstockholm.se</p>
          </div>
        </div>
        <div className="border-t border-stone-700 mt-8 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} ICK Stockholm. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
