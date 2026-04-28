import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

type RangeKey = '7d' | '30d' | '90d';

function getDateRange(range: RangeKey): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function buildDayBuckets(start: Date, end: Date): Map<string, number> {
  const buckets = new Map<string, number>();
  const cur = new Date(start);
  while (cur <= end) {
    buckets.set(cur.toISOString().split('T')[0]!, 0);
    cur.setDate(cur.getDate() + 1);
  }
  return buckets;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalReservationsThisMonth,
      pendingReservations,
      confirmedReservationsToday,
      totalCateringRequests,
      activeCateringRequests,
      totalCustomers,
      newCustomersThisMonth,
      totalLocations,
      totalMenuItems,
    ] = await Promise.all([
      this.prisma.reservation.count({ where: { createdAt: { gte: startOfMonth }, deletedAt: null } }),
      this.prisma.reservation.count({ where: { status: 'PENDING', deletedAt: null } }),
      this.prisma.reservation.count({ where: { reservationDate: { gte: startOfDay }, status: { in: ['CONFIRMED', 'SEATED'] }, deletedAt: null } }),
      this.prisma.cateringRequest.count({ where: { deletedAt: null } }),
      this.prisma.cateringRequest.count({ where: { status: { in: ['INQUIRY', 'QUOTED', 'DEPOSIT_PAID', 'CONFIRMED'] }, deletedAt: null } }),
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.location.count({ where: { isActive: true } }),
      this.prisma.menuItem.count({ where: { deletedAt: null } }),
    ]);

    return {
      reservations: {
        thisMonth: totalReservationsThisMonth,
        pending: pendingReservations,
        confirmedToday: confirmedReservationsToday,
      },
      catering: {
        total: totalCateringRequests,
        active: activeCateringRequests,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      operations: {
        activeLocations: totalLocations,
        totalMenuItems: totalMenuItems,
      },
    };
  }

  async getCharts(range: RangeKey = '30d') {
    const { start, end } = getDateRange(range);

    // $queryRaw required: Prisma does not support DATE_TRUNC + GROUP BY natively
    const [reservationsByDay, cateringByDay, newCustomersByDay] = await Promise.all([
      this.prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT DATE_TRUNC('day', reservation_date) AS day, COUNT(*) AS count
        FROM reservations
        WHERE reservation_date >= ${start} AND reservation_date <= ${end} AND deleted_at IS NULL
        GROUP BY day ORDER BY day ASC
      `,
      this.prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS count
        FROM catering_requests
        WHERE created_at >= ${start} AND created_at <= ${end} AND deleted_at IS NULL
        GROUP BY day ORDER BY day ASC
      `,
      this.prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS count
        FROM customers
        WHERE created_at >= ${start} AND created_at <= ${end}
        GROUP BY day ORDER BY day ASC
      `,
    ]);

    const toSeries = (
      buckets: Map<string, number>,
      rows: Array<{ day: Date; count: bigint }>,
    ) => {
      for (const row of rows) {
        const key = row.day.toISOString().split('T')[0]!;
        if (buckets.has(key)) buckets.set(key, Number(row.count));
      }
      return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
    };

    return {
      range,
      reservations: toSeries(buildDayBuckets(start, end), reservationsByDay),
      catering: toSeries(buildDayBuckets(start, end), cateringByDay),
      newCustomers: toSeries(buildDayBuckets(start, end), newCustomersByDay),
    };
  }

  async getRecentActivities(limit = 20) {
    const [recentReservations, recentCatering, recentCustomers, recentPosts] = await Promise.all([
      this.prisma.reservation.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, guestName: true, status: true, createdAt: true },
      }),
      this.prisma.cateringRequest.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, contactName: true, status: true, createdAt: true },
      }),
      this.prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, name: true, createdAt: true },
      }),
      this.prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: { id: true, slug: true, titleI18n: true, publishedAt: true },
      }),
    ]);

    const activities: Array<{ type: string; id: string; label: string; status?: string; timestamp: string }> = [];

    for (const r of recentReservations) {
      activities.push({ type: 'RESERVATION', id: String(r.id), label: `Reservation: ${r.guestName}`, status: r.status, timestamp: r.createdAt.toISOString() });
    }
    for (const c of recentCatering) {
      activities.push({ type: 'CATERING', id: String(c.id), label: `Catering: ${c.contactName}`, status: c.status, timestamp: c.createdAt.toISOString() });
    }
    for (const cu of recentCustomers) {
      activities.push({ type: 'CUSTOMER', id: String(cu.id), label: `New customer: ${cu.name}`, timestamp: cu.createdAt.toISOString() });
    }
    for (const p of recentPosts) {
      const title = (p.titleI18n as Record<string, string>)?.en ?? 'Post';
      activities.push({ type: 'POST_PUBLISHED', id: String(p.id), label: `Published: ${title}`, timestamp: (p.publishedAt ?? new Date()).toISOString() });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, limit);
  }

  async getTopItems(range: RangeKey = '30d') {
    const { start } = getDateRange(range);

    const [topMenuCategories, topCateringPackages, recentPublishedPosts] = await Promise.all([
      this.prisma.menuCategory.findMany({
        where: { isActive: true },
        include: { items: { where: { deletedAt: null }, select: { id: true } } },
        orderBy: { sortOrder: 'asc' },
        take: 10,
      }),
      this.prisma.cateringPackage.findMany({
        where: { isActive: true },
        take: 10,
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, basePrice: true, minGuests: true, maxGuests: true },
      }),
      this.prisma.blogPost.findMany({
        where: { status: 'PUBLISHED', publishedAt: { gte: start } },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: { id: true, slug: true, titleI18n: true, author: true, views: true, publishedAt: true },
      }),
    ]);

    return {
      range,
      menuCategories: topMenuCategories.map((c) => ({
        id: Number(c.id),
        nameI18n: c.nameI18n,
        itemCount: c.items.length,
      })),
      cateringPackages: topCateringPackages.map((p) => ({
        id: Number(p.id),
        name: p.name,
        basePrice: p.basePrice ? Number(p.basePrice) : null,
        minGuests: p.minGuests,
        maxGuests: p.maxGuests,
      })),
      topPosts: recentPublishedPosts.map((p) => ({
        id: Number(p.id),
        slug: p.slug,
        titleI18n: p.titleI18n,
        author: p.author,
        views: p.views,
        publishedAt: p.publishedAt?.toISOString() ?? null,
      })),
    };
  }

  async getBranches() {
    const locations = await this.prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true, state: true },
    });

    const stats = await Promise.all(
      locations.map(async (loc) => {
        const [totalReservations, confirmedReservations, pendingReservations, totalCatering] = await Promise.all([
          this.prisma.reservation.count({ where: { locationId: loc.id, deletedAt: null } }),
          this.prisma.reservation.count({ where: { locationId: loc.id, status: { in: ['CONFIRMED', 'SEATED', 'COMPLETED'] }, deletedAt: null } }),
          this.prisma.reservation.count({ where: { locationId: loc.id, status: 'PENDING', deletedAt: null } }),
          this.prisma.cateringRequest.count({ where: { locationId: loc.id, deletedAt: null } }),
        ]);

        return {
          locationId: Number(loc.id),
          name: loc.name,
          city: loc.city,
          state: loc.state,
          reservations: { total: totalReservations, confirmed: confirmedReservations, pending: pendingReservations },
          catering: { total: totalCatering },
        };
      }),
    );

    return stats;
  }
}
