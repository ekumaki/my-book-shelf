import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NavBar from './NavBar';
import clsx from 'clsx';

export default function Layout() {
    const { theme } = useTheme();

    return (
        <div
            id="app-root"
            className={clsx(
                "h-screen w-full md:max-w-[480px] md:mx-auto bg-white md:shadow-2xl relative flex flex-col overflow-hidden",
                theme.cssClass,
                theme.textColor
            )}
        >
            <div className="flex-1 min-h-0 overflow-hidden">
                <Outlet />
            </div>
            <NavBar />
        </div>
    );
}
