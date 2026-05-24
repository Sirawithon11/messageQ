import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { pathname } = useRouter();

  const navLink = (href, label) => (
    <Link
      href={href}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        pathname === href
          ? 'bg-blue-700 text-white'
          : 'text-blue-100 hover:bg-blue-600 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-blue-800 shadow">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-white font-bold text-xl tracking-tight">ShopManager</span>
        <div className="flex gap-2">
          {navLink('/', 'Manage Products')}
          {navLink('/shop', 'Shop')}
        </div>
      </div>
    </nav>
  );
}
