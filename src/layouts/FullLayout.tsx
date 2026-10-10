import { Outlet } from 'react-router';
import { Header } from './Header';

export function FullLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Beverage Ordering. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
