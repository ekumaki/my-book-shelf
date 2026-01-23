import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

export default function Layout() {
    const { showScanner } = useTheme();

    return (
        <div
            id="app-root"
            className={clsx(
                "h-screen w-full md:max-w-[480px] md:mx-auto bg-white md:shadow-2xl relative flex flex-col overflow-hidden"
            )}
        >
            <div className="flex-1 min-h-0 overflow-hidden">
                <Outlet />
            </div>
            {!showScanner && <NavBar />}
        </div>
    );
}
