import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NavBar from './NavBar';
import clsx from 'clsx';

export default function Layout() {
    const { theme } = useTheme();

    return (
        <div id="app-root" className={clsx("h-full w-full max-w-md bg-white shadow-2xl relative flex flex-col overflow-hidden", theme.cssClass, theme.textColor)}>
            <div className="flex-1 overflow-hidden relative">
                <Outlet />
            </div>
            <NavBar />
        </div>
    );
}
