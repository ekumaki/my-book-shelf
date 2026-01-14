import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import clsx from 'clsx';

export default function Layout() {

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
            <NavBar />
        </div>
    );
}
