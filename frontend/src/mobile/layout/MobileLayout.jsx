import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const MobileLayout = () => {
    return (
        <div className="min-h-screen bg-navy text-foreground font-sans overflow-x-hidden pb-24">
            <main className="animate-fade-in relative">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default MobileLayout;
