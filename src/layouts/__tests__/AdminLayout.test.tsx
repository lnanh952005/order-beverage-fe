// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { AdminLayout } from '../AdminLayout';

describe('AdminLayout Sidebar Navigation', () => {
  afterEach(cleanup);

  it('highlights the "Đơn hàng" tab with primary background and blur shadow when on /admin/orders', () => {
    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="orders" element={<div>Orders Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const ordersLink = screen.getByRole('link', { name: /Đơn hàng/i });
    expect(ordersLink).toHaveClass('bg-primary');
    expect(ordersLink).toHaveClass('text-primary-foreground');
    expect(ordersLink).toHaveClass('shadow-md');
    expect(ordersLink).toHaveClass('shadow-primary/25');

    const paymentsLink = screen.getByRole('link', { name: /Thanh toán/i });
    expect(paymentsLink).not.toHaveClass('bg-primary');
    expect(paymentsLink).toHaveClass('text-muted-foreground');
  });

  it('keeps "Đơn hàng" active when navigating to child route /admin/orders/ORD-1234', () => {
    render(
      <MemoryRouter initialEntries={['/admin/orders/ORD-1234']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="orders/:orderCode" element={<div>Order Detail Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const ordersLink = screen.getByRole('link', { name: /Đơn hàng/i });
    expect(ordersLink).toHaveClass('bg-primary');
    expect(ordersLink).toHaveClass('shadow-md');
    expect(ordersLink).toHaveClass('shadow-primary/25');
  });

  it('highlights "Thanh toán" tab and deactivates "Đơn hàng" when on /admin/payments', () => {
    render(
      <MemoryRouter initialEntries={['/admin/payments']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="payments" element={<div>Payments Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const paymentsLink = screen.getByRole('link', { name: /Thanh toán/i });
    expect(paymentsLink).toHaveClass('bg-primary');
    expect(paymentsLink).toHaveClass('shadow-md');

    const ordersLink = screen.getByRole('link', { name: /Đơn hàng/i });
    expect(ordersLink).not.toHaveClass('bg-primary');
    expect(ordersLink).toHaveClass('text-muted-foreground');
  });
});
