// app/api/provider/dashboard-stats/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');

  if (!providerId) {
    return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
  }

  try {
    // --- Fetch Total Completed Orders (Sales) ---
    const completedOrdersSnapshot = await dbAdmin.collection('orders')
      .where('providerId', '==', providerId)
      .where('status', '==', 'completed')
      .get();
    const totalSales = completedOrdersSnapshot.size;

    // --- Fetch Total New Quotes (Visitors - repurposed) ---
    const newQuotesSnapshot = await dbAdmin.collection('quotes')
      .where('providerId', '==', providerId)
      .get(); // Could filter by time if needed for 'new this week'
    const totalVisitors = newQuotesSnapshot.size; // Using total quotes as a proxy for visitors

    // --- Fetch Total Active Orders (Refunds - repurposed) ---
    const activeOrdersSnapshot = await dbAdmin.collection('orders')
      .where('providerId', '==', providerId)
      .where('status', '==', 'in_progress')
      .get();
    const totalRefunds = activeOrdersSnapshot.size; // Using total in-progress orders

    // --- Sales Data for Chart (Last 30 days) ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesDataSnapshot = await dbAdmin.collection('orders')
      .where('providerId', '==', providerId)
      .where('status', '==', 'completed')
      .where('completedAt', '>=', thirtyDaysAgo)
      .orderBy('completedAt', 'asc')
      .get();

    const salesDataMap = new Map();
    salesDataSnapshot.docs.forEach(doc => {
      const order = doc.data();
      const date = order.completedAt.toDate().toISOString().split('T')[0]; // YYYY-MM-DD
      const amount = order.customOfferDetails?.amount || 0;
      salesDataMap.set(date, (salesDataMap.get(date) || 0) + amount);
    });

    const salesData = Array.from(salesDataMap, ([date, value]) => ({ date, value }));

    // Fill in missing dates with 0 for a continuous chart
    const allDates = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(thirtyDaysAgo.getDate() + i);
        allDates.push(d.toISOString().split('T')[0]);
    }
    const fullSalesData = allDates.map(date => ({
        date,
        value: salesData.find(item => item.date === date)?.value || 0
    }));


    // --- Top Categories (Services) ---
    // This requires aggregating sales per service.
    // For simplicity, let's count orders per service, or you could aggregate revenue.
    const serviceSalesAggregation = {};
    for (const doc of salesDataSnapshot.docs) {
      const order = doc.data();
      const serviceId = order.serviceId;
      if (serviceId) {
        serviceSalesAggregation[serviceId] = (serviceSalesAggregation[serviceId] || 0) + (order.customOfferDetails?.amount || 0);
      }
    }

    const topServicePromises = Object.entries(serviceSalesAggregation).map(async ([serviceId, totalAmount]) => {
      const serviceDoc = await dbAdmin.collection('services').doc(serviceId).get();
      return {
        name: serviceDoc.exists ? serviceDoc.data().title : `Unknown Service (${serviceId})`,
        value: totalAmount,
      };
    });

    let topCategories = await Promise.all(topServicePromises);
    topCategories.sort((a, b) => b.value - a.value); // Sort by value descending

    // Convert values to percentages if desired for the doughnut chart, or pass raw values
    const totalCategoryValue = topCategories.reduce((sum, cat) => sum + cat.value, 0);
    topCategories = topCategories.map(cat => ({
      name: cat.name,
      value: totalCategoryValue > 0 ? parseFloat(((cat.value / totalCategoryValue) * 100).toFixed(1)) : 0
    })).slice(0, 5); // Limit to top 5, for example

    return NextResponse.json({
      totalSales,
      totalVisitors,
      totalRefunds,
      salesData: fullSalesData,
      topCategories,
    });
  } catch (error) {
    console.error("Error fetching provider dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats." }, { status: 500 });
  }
}