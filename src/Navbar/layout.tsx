import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './navbar';

const Layout = () => {
    const location = useLocation();

    // Check if the current route is either '/admin' or '/adminupgrade' (or any subroutes)
    const hideNavbar = location.pathname.startsWith('/admin/*') || location.pathname.startsWith('/adminupgrade');

    return (
        <div>
            {!hideNavbar && <Navbar />} {/* Conditionally render Navbar */}
            <Outlet /> {/* This renders the matched route's component */}
        </div>
    );
};

export default Layout;
