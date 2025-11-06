import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLocation, Outlet } from "react-router-dom";

const PageWrapper = () => {
    const location = useLocation();

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.fromTo(
            ".page",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }, [location.pathname]);

    return (
        <div className="page min-h-screen  text-white">
            <Outlet />
        </div>
    );
};

export default PageWrapper;
