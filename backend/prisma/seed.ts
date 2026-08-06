import bcrypt from 'bcryptjs';
import { Importance, PrismaClient, RateType, Role, SourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.historicalRate.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.news.deleteMany();
  await prisma.economicEvent.deleteMany();
  await prisma.exchangeOffice.deleteMany();
  await prisma.source.deleteMany();
  await prisma.currency.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.user.createMany({
    data: [
      {
        fullName: 'Admin User',
        email: 'admin@exchange.local',
        passwordHash,
        role: Role.ADMIN,
      },
      {
        fullName: 'Terminal User',
        email: 'user@exchange.local',
        passwordHash,
        role: Role.USER,
      },
    ],
  });

  await prisma.currency.createMany({
    data: [
      { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', flag: '🇺🇸' },
      { code: 'EUR', name: 'Euro', symbol: '€', country: 'Eurozone', flag: '🇪🇺' },
      { code: 'GBP', name: 'Pound Sterling', symbol: '£', country: 'United Kingdom', flag: '🇬🇧' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan', flag: '🇯🇵' },
    ],
  });

  const sourceA = await prisma.source.create({
    data: { name: 'Central FX Desk', website: 'https://centralfx.example.com', type: SourceType.CENTRAL_BANK },
  });
  const sourceB = await prisma.source.create({
    data: { name: 'City Exchange', website: 'https://cityexchange.example.com', type: SourceType.EXCHANGE_OFFICE },
  });

  const rateRows = [
    { currencyCode: 'USD', buy: 1.36, sell: 1.37, sourceId: sourceA.id },
    { currencyCode: 'EUR', buy: 1.48, sell: 1.5, sourceId: sourceA.id },
    { currencyCode: 'GBP', buy: 1.73, sell: 1.75, sourceId: sourceB.id },
    { currencyCode: 'JPY', buy: 0.0091, sell: 0.0094, sourceId: sourceB.id },
  ];

  for (const row of rateRows) {
    await prisma.exchangeRate.createMany({
      data: [
        { currencyCode: row.currencyCode, rate: row.buy, type: RateType.BUY, sourceId: row.sourceId },
        { currencyCode: row.currencyCode, rate: row.sell, type: RateType.SELL, sourceId: row.sourceId },
      ],
    });

    await prisma.historicalRate.createMany({
      data: Array.from({ length: 20 }).map((_, idx) => ({
        currencyCode: row.currencyCode,
        buyRate: row.buy - idx * 0.001,
        sellRate: row.sell - idx * 0.001,
        sourceId: row.sourceId,
        recordedAt: new Date(Date.now() - idx * 60 * 60 * 1000),
      })),
    });
  }

  await prisma.news.createMany({
    data: [
      {
        title: 'USD Demand Climbs in Midday Trading',
        content: 'Demand increased across regional exchange offices as importers covered short positions.',
        category: 'Markets',
        countryCode: 'US',
        currencyCode: 'USD',
        importance: Importance.HIGH,
        sourceId: sourceA.id,
      },
      {
        title: 'Euro Holds Near Weekly High',
        content: 'EUR remained supported by stronger manufacturing sentiment across Europe.',
        category: 'Macro',
        countryCode: 'EU',
        currencyCode: 'EUR',
        importance: Importance.MEDIUM,
        sourceId: sourceB.id,
      },
    ],
  });

  await prisma.economicEvent.createMany({
    data: [
      {
        title: 'US Non-Farm Payrolls',
        country: 'United States',
        currencyCode: 'USD',
        forecast: '195K',
        previous: '189K',
        actual: null,
        importance: Importance.HIGH,
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 12),
      },
      {
        title: 'Eurozone CPI Flash',
        country: 'Eurozone',
        currencyCode: 'EUR',
        forecast: '2.5%',
        previous: '2.6%',
        actual: null,
        importance: Importance.HIGH,
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    ],
  });

  await prisma.exchangeOffice.createMany({
    data: [
      {
        name: 'Downtown Exchange',
        city: 'Dubai',
        address: 'Financial Center St',
        phone: '+971-555-1000',
        latitude: 25.2048,
        longitude: 55.2708,
        verified: true,
      },
      {
        name: 'Harbor FX Office',
        city: 'Manama',
        address: 'Capital District 5',
        phone: '+973-1700-0000',
        latitude: 26.2235,
        longitude: 50.5876,
        verified: true,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
