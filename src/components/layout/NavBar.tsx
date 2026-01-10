import { NavLink } from 'react-router-dom';
import { Bank, MagnifyingGlass, Books, Lightbulb, Gear } from '@phosphor-icons/react';
import clsx from 'clsx';

export default function NavBar() {
    const navItems = [
        { to: '/', label: '本棚', icon: Books },
        { to: '/search', label: '探す', icon: MagnifyingGlass },
        { to: '/library', label: 'ライブラリ', icon: Bank },
        { to: '/knowledge', label: 'ナレッジ', icon: Lightbulb },
        { to: '/settings', label: '設定', icon: Gear },
    ];

    return (
        <div className="bg-white border-t border-gray-200 flex justify-around items-center pb-safe pt-2 h-16 z-50 shrink-0">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        clsx(
                            "flex flex-col items-center justify-center w-full h-full transition-colors",
                            isActive ? "text-amber-700" : "text-gray-400 hover:text-gray-600"
                        )
                    }
                >
                    <item.icon size={24} weight="regular" className="mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
            ))}
        </div>
    );
}
