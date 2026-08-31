import { PrismaClient, CouponType, MovementType, ProductStatus, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Seeder de Wally Store con catálogo exclusivo de Moda & Accesorios (Treinta Style)...');

  // 1. ROLES & PERMISSIONS
  console.log('1. Creando Roles y Permisos...');
  const permissionsList = [
    { name: 'products:create', description: 'Crear productos' },
    { name: 'products:read', description: 'Ver productos' },
    { name: 'products:update', description: 'Actualizar productos' },
    { name: 'products:delete', description: 'Eliminar productos' },
    { name: 'inventory:read', description: 'Ver inventario' },
    { name: 'inventory:adjust', description: 'Ajustar inventario' },
    { name: 'orders:read', description: 'Ver órdenes' },
    { name: 'orders:update', description: 'Actualizar órdenes' },
    { name: 'coupons:create', description: 'Crear cupones' },
    { name: 'coupons:read', description: 'Ver cupones' },
    { name: 'coupons:update', description: 'Actualizar cupones' },
    { name: 'coupons:delete', description: 'Eliminar cupones' },
    { name: 'audit:read', description: 'Ver logs de auditoría' },
    { name: 'users:manage', description: 'Administrar usuarios y roles' },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: { description: 'Control total de la plataforma' },
    create: {
      name: 'SUPER_ADMIN',
      description: 'Control total de la plataforma',
    },
  });

  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: p.id,
      },
    });
  }

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: { description: 'Cliente estándar de la tienda' },
    create: {
      name: 'CUSTOMER',
      description: 'Cliente estándar de la tienda',
    },
  });

  const customerPermissions = allPermissions.filter((p) =>
    ['products:read', 'orders:read'].includes(p.name),
  );

  for (const p of customerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: customerRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: customerRole.id,
        permissionId: p.id,
      },
    });
  }

  // 2. USUARIOS INICIALES
  console.log('2. Creando Usuarios Iniciales...');
  const adminPasswordHash = await argon2.hash('Admin123456!');
  const customerPasswordHash = await argon2.hash('Cliente123456!');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@wallystore.com' },
    update: {},
    create: {
      email: 'admin@wallystore.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Wally',
      phone: '+18095550100',
      status: UserStatus.ACTIVE,
      roleId: superAdminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'cliente@wallystore.com' },
    update: {},
    create: {
      email: 'cliente@wallystore.com',
      passwordHash: customerPasswordHash,
      firstName: 'Carlos',
      lastName: 'Mendoza',
      phone: '+18095550200',
      status: UserStatus.ACTIVE,
      roleId: customerRole.id,
    },
  });

  // 3. CATEGORÍAS DE MODA & ACCESORIOS (TREINTA STYLE)
  console.log('3. Creando Categorías de Moda...');
  const categoriesData = [
    { name: 'Tenis & Sneakers', slug: 'tenis-sneakers', description: 'Calzado deportivo, urbano y de colección', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400' },
    { name: 'Perfumes & Fragancias', slug: 'perfumes-fragancias', description: 'Perfumes de diseñador para hombre y mujer', imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400' },
    { name: 'T-Shirts & Camisetas', slug: 't-shirts-camisetas', description: 'Camisetas oversize, básicas y de corte urbano', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400' },
    { name: 'Pantalones & Jeans', slug: 'pantalones-jeans', description: 'Jeans denim, pantalones cargo y joggers', imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=400' },
    { name: 'Relojes & Accesorios', slug: 'relojes-accesorios', description: 'Relojes elegantes, cronógrafos y smartwatches', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400' },
    { name: 'Gorras & Caps', slug: 'gorras-caps', description: 'Gorras snapback, trucker y fitted originales', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400' },
    { name: 'Camisas & Polos', slug: 'camisas-polos', description: 'Camisas casuales y polos clásicos', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400' },
    { name: 'Chaquetas & Hoodies', slug: 'chaquetas-hoodies', description: 'Sudaderas con capucha y chaquetas de temporada', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl },
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  // 4. MARCAS
  console.log('4. Creando Marcas...');
  const brandsData = [
    { name: 'Nike', slug: 'nike' },
    { name: 'Adidas', slug: 'adidas' },
    { name: 'Dior', slug: 'dior' },
    { name: 'Chanel', slug: 'chanel' },
    { name: 'Ralph Lauren', slug: 'ralph-lauren' },
    { name: 'Levi\'s', slug: 'levis' },
    { name: 'New Era', slug: 'new-era' },
    { name: 'Casio / G-Shock', slug: 'casio-g-shock' },
    { name: 'Zara Man', slug: 'zara-man' },
    { name: 'Puma', slug: 'puma' },
  ];

  const brandMap = new Map<string, string>();
  for (const br of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: br.slug },
      update: { name: br.name },
      create: br,
    });
    brandMap.set(br.slug, created.id);
  }

  // 5. PRODUCTOS DE MODA, TENIS, PERFUMES, RELOJES, GORRAS (TREINTA STYLE)
  console.log('5. Creando Productos de Catálogo...');
  const productsData = [
    // --- 1. TENIS & SNEAKERS ---
    {
      name: 'Nike Air Jordan 1 Retro High OG',
      slug: 'nike-air-jordan-1-retro-high-og',
      sku: 'NK-AJ1-OG',
      shortDescription: 'Zapatillas icónicas de cuero genuino y amortiguación Nike Air.',
      description: 'El legendario Nike Air Jordan 1 Retro combina un estilo clásico con materiales de primera calidad. Confeccionado en cuero premium, suela de goma con tracción circular y tecnología Air-Sole para máxima comodidad.',
      basePrice: 180.0,
      compareAtPrice: 210.0,
      costPrice: 90.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: true,
      categorySlug: 'tenis-sneakers',
      brandSlug: 'nike',
      images: [
        { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600', isMain: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600', isMain: false, displayOrder: 1 },
      ],
      variants: [
        { sku: 'NK-AJ1-CHI-40', title: 'Chicago Red / Talla 40 (US 8)', attributes: { Color: 'Chicago Red', Talla: '40' }, price: 180.0, stock: 35 },
        { sku: 'NK-AJ1-CHI-42', title: 'Chicago Red / Talla 42 (US 9.5)', attributes: { Color: 'Chicago Red', Talla: '42' }, price: 180.0, stock: 24 },
        { sku: 'NK-AJ1-BLK-42', title: 'Shadow Black / Talla 42 (US 9.5)', attributes: { Color: 'Shadow Black', Talla: '42' }, price: 185.0, stock: 18 },
      ],
    },
    {
      name: 'Adidas Ultraboost Light Running',
      slug: 'adidas-ultraboost-light-running',
      sku: 'AD-UB-LIGHT',
      shortDescription: 'Zapatillas ultraligeras con tecnología Boost de retorno de energía.',
      description: 'Diseñadas para brindar la máxima amortiguación y ligereza. Tejido Primeknit transpirable y suela Continental Rubber para agarre óptimo en cualquier superficie.',
      basePrice: 149.99,
      compareAtPrice: 190.0,
      costPrice: 75.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: false,
      categorySlug: 'tenis-sneakers',
      brandSlug: 'adidas',
      images: [
        { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'AD-UB-WHT-41', title: 'Triple White / Talla 41', attributes: { Color: 'Blanco', Talla: '41' }, price: 149.99, stock: 40 },
        { sku: 'AD-UB-BLK-43', title: 'Core Black / Talla 43', attributes: { Color: 'Negro', Talla: '43' }, price: 149.99, stock: 30 },
      ],
    },
    {
      name: 'New Balance 550 Vintage White',
      slug: 'new-balance-550-vintage-white',
      sku: 'NB-550-VNTG',
      shortDescription: 'Sneakers de silueta retro basket de los años 80.',
      description: 'El clásico modelo de baloncesto de los 80 regresa con piel de primera calidad, detalles perforados y estética vintage insuperable.',
      basePrice: 120.0,
      compareAtPrice: 140.0,
      costPrice: 60.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: false,
      isNewArrival: true,
      categorySlug: 'tenis-sneakers',
      brandSlug: 'puma',
      images: [
        { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'NB-550-GRN-41', title: 'White Green / Talla 41', attributes: { Color: 'Verde/Blanco', Talla: '41' }, price: 120.0, stock: 22 },
        { sku: 'NB-550-GRN-43', title: 'White Green / Talla 43', attributes: { Color: 'Verde/Blanco', Talla: '43' }, price: 120.0, stock: 15 },
      ],
    },

    // --- 2. PERFUMES & FRAGANCIAS ---
    {
      name: 'Dior Sauvage Eau de Parfum 100ml',
      slug: 'dior-sauvage-eau-de-parfum-100ml',
      sku: 'DIOR-SV-100',
      shortDescription: 'Fragancia masculina magnética con notas de bergamota de Calabria y vainilla.',
      description: 'Una interpretación sensual y misteriosa de la icónica fragancia Sauvage. Notas frescas de bergamota combinadas con el calor del ámbar y absoluto de vainilla de Papúa Nueva Guinea.',
      basePrice: 135.0,
      compareAtPrice: 160.0,
      costPrice: 70.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: false,
      categorySlug: 'perfumes-fragancias',
      brandSlug: 'dior',
      images: [
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600', isMain: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600', isMain: false, displayOrder: 1 },
      ],
      variants: [
        { sku: 'DIOR-SV-EDP-100ML', title: 'Frasco 100ml EDP', attributes: { Tamaño: '100ml' }, price: 135.0, stock: 45 },
        { sku: 'DIOR-SV-EDP-200ML', title: 'Frasco 200ml Jumbo', attributes: { Tamaño: '200ml' }, price: 195.0, stock: 20 },
      ],
    },
    {
      name: 'Bleu de Chanel Parfum 100ml',
      slug: 'bleu-de-chanel-parfum-100ml',
      sku: 'CHN-BLEU-100',
      shortDescription: 'Aroma aromático amaderado noble e intenso.',
      description: 'Un elogio a la libertad masculina en una fragancia amaderada y aromática con una estela cautivadora. Notas de madera de sándalo de Nueva Caledonia y cedro.',
      basePrice: 165.0,
      compareAtPrice: 185.0,
      costPrice: 85.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: true,
      categorySlug: 'perfumes-fragancias',
      brandSlug: 'chanel',
      images: [
        { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'CHN-BLEU-100ML', title: 'Frasco 100ml Parfum', attributes: { Tamaño: '100ml' }, price: 165.0, stock: 32 },
      ],
    },

    // --- 3. T-SHIRTS & CAMISETAS ---
    {
      name: 'Camiseta Casual Heavy Cotton Oversize',
      slug: 'camiseta-casual-heavy-cotton-oversize',
      sku: 'TS-OVR-HVY',
      shortDescription: 'T-Shirt de corte relajado confeccionada en 100% algodón pesado de 240 GSM.',
      description: 'La camiseta básica perfecta estilo streetwear. Confeccionada con algodón pesado peinado, cuello cerrado reforzado y caída estructurada impecable.',
      basePrice: 22.5,
      compareAtPrice: 35.0,
      costPrice: 8.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: true,
      categorySlug: 't-shirts-camisetas',
      brandSlug: 'zara-man',
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600', isMain: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600', isMain: false, displayOrder: 1 },
      ],
      variants: [
        { sku: 'TS-OVR-WHT-M', title: 'Blanco Crudo / Talla M', attributes: { Color: 'Blanco Crudo', Talla: 'M' }, price: 22.5, stock: 65 },
        { sku: 'TS-OVR-WHT-L', title: 'Blanco Crudo / Talla L', attributes: { Color: 'Blanco Crudo', Talla: 'L' }, price: 22.5, stock: 50 },
        { sku: 'TS-OVR-BLK-M', title: 'Negro Lavado / Talla M', attributes: { Color: 'Negro Lavado', Talla: 'M' }, price: 22.5, stock: 45 },
        { sku: 'TS-OVR-BLK-L', title: 'Negro Lavado / Talla L', attributes: { Color: 'Negro Lavado', Talla: 'L' }, price: 22.5, stock: 38 },
      ],
    },
    {
      name: 'Camisa Cuadros Casual Flanela Premium',
      slug: 'camisa-cuadros-casual-flanela-premium',
      sku: 'CMS-CD-FLN',
      shortDescription: 'Camisa de franela suave a cuadros, cómoda y abrigadora.',
      description: 'Diseño clásico con botones resistentes, bolsillo en el pecho y tela cepillada suave al tacto. Ideal para un look casual o de capas.',
      basePrice: 42.0,
      compareAtPrice: 55.0,
      costPrice: 18.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: false,
      isNewArrival: false,
      categorySlug: 'camisas-polos',
      brandSlug: 'zara-man',
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'CMS-CD-PUR-M', title: 'Morada Cuadros / Talla M', attributes: { Color: 'Morada', Talla: 'M' }, price: 42.0, stock: 30 },
        { sku: 'CMS-CD-RED-L', title: 'Roja Leñador / Talla L', attributes: { Color: 'Roja', Talla: 'L' }, price: 42.0, stock: 25 },
      ],
    },

    // --- 4. PANTALONES & JEANS ---
    {
      name: 'Jeans Ajustados Slim Fit Denim Stretch',
      slug: 'jeans-ajustados-slim-fit-denim-stretch',
      sku: 'JNS-SLIM-511',
      shortDescription: 'Jeans de mezclilla con elasticidad para máxima comodidad diaria.',
      description: 'El clásico corte slim fit moderno que se adapta a tu cuerpo sin restringir tus movimientos. Lavado índigo duradero y 5 bolsillos.',
      basePrice: 39.99,
      compareAtPrice: 59.99,
      costPrice: 16.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: false,
      categorySlug: 'pantalones-jeans',
      brandSlug: 'levis',
      images: [
        { url: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'JNS-SLIM-30', title: 'Azul Medio / Talla 30', attributes: { Talla: '30', Color: 'Azul Medio' }, price: 39.99, stock: 35 },
        { sku: 'JNS-SLIM-32', title: 'Azul Medio / Talla 32', attributes: { Talla: '32', Color: 'Azul Medio' }, price: 39.99, stock: 48 },
        { sku: 'JNS-SLIM-34', title: 'Azul Medio / Talla 34', attributes: { Talla: '34', Color: 'Azul Medio' }, price: 39.99, stock: 26 },
      ],
    },
    {
      name: 'Pantalón Cargo Táctico Streetwear',
      slug: 'pantalon-cargo-tactico-streetwear',
      sku: 'CRG-PNT-BLK',
      shortDescription: 'Pantalón cargo con múltiples bolsillos funcionales y ajuste en tobillos.',
      description: 'Estilo utilitario con tela ripstop resistente, 6 bolsillos estratégicos y cordón de ajuste en cintura y tobillos.',
      basePrice: 35.0,
      compareAtPrice: 48.0,
      costPrice: 14.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: false,
      isNewArrival: true,
      categorySlug: 'pantalones-jeans',
      brandSlug: 'zara-man',
      images: [
        { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'CRG-BLK-M', title: 'Negro Mate / Talla M', attributes: { Color: 'Negro', Talla: 'M' }, price: 35.0, stock: 28 },
        { sku: 'CRG-KHK-L', title: 'Khaki Militar / Talla L', attributes: { Color: 'Khaki', Talla: 'L' }, price: 35.0, stock: 20 },
      ],
    },

    // --- 5. RELOJES & ACCESORIOS ---
    {
      name: 'Reloj Cronógrafo Acero Inoxidable Black Dial',
      slug: 'reloj-cronografo-acero-inoxidable-black-dial',
      sku: 'RLJ-CRN-BLK',
      shortDescription: 'Reloj de cuarzo de alta precisión con caja de acero inoxidable y resistencia al agua.',
      description: 'Elegancia y precisión. Equipado con 3 subesferas de cronómetro, fechador automático, cristal mineral resistente a rayaduras y correa de eslabones pulidos.',
      basePrice: 89.0,
      compareAtPrice: 130.0,
      costPrice: 35.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: true,
      categorySlug: 'relojes-accesorios',
      brandSlug: 'casio-g-shock',
      images: [
        { url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600', isMain: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600', isMain: false, displayOrder: 1 },
      ],
      variants: [
        { sku: 'RLJ-SLV-BLK', title: 'Plata con Esfera Negra', attributes: { Acabado: 'Plata/Negro' }, price: 89.0, stock: 25 },
        { sku: 'RLJ-GLD-BLK', title: 'Dorado con Esfera Negra', attributes: { Acabado: 'Dorado/Negro' }, price: 99.0, stock: 15 },
      ],
    },
    {
      name: 'Smartwatch Deportivo AMOLED Water Resistant',
      slug: 'smartwatch-deportivo-amoled-water-resistant',
      sku: 'SMT-WTC-PRO',
      shortDescription: 'Reloj inteligente con monitor cardíaco, GPS y batería de 10 días.',
      description: 'Pantalla AMOLED táctil de alta definición, seguimiento de más de 100 modos deportivos, sensor SpO2 de oxígeno y notificaciones de llamadas en tiempo real.',
      basePrice: 59.99,
      compareAtPrice: 85.0,
      costPrice: 25.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: false,
      isNewArrival: true,
      categorySlug: 'relojes-accesorios',
      brandSlug: 'casio-g-shock',
      images: [
        { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'SMT-WTC-BLK', title: 'Negro Midnight', attributes: { Color: 'Negro' }, price: 59.99, stock: 50 },
      ],
    },

    // --- 6. GORRAS & CAPS ---
    {
      name: 'Gorra New Era NY Yankees 59FIFTY Fitted',
      slug: 'gorra-new-era-ny-yankees-59fifty-fitted',
      sku: 'NE-NY-5950',
      shortDescription: 'Gorra oficial cerrada de visera plana con logo bordado en relieve.',
      description: 'La gorra más emblemática del mundo deportivo y urbano. Corona estructurada, visera plana con opción de curvado y bordado de alta definición.',
      basePrice: 38.0,
      compareAtPrice: 45.0,
      costPrice: 15.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: false,
      categorySlug: 'gorras-caps',
      brandSlug: 'new-era',
      images: [
        { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'NE-NY-NAVY-714', title: 'Azul Navy / Talla 7 1/4', attributes: { Color: 'Navy', Talla: '7 1/4' }, price: 38.0, stock: 30 },
        { sku: 'NE-NY-NAVY-738', title: 'Azul Navy / Talla 7 3/8', attributes: { Color: 'Navy', Talla: '7 3/8' }, price: 38.0, stock: 28 },
        { sku: 'NE-NY-BLK-712', title: 'Black on Black / Talla 7 1/2', attributes: { Color: 'Black', Talla: '7 1/2' }, price: 40.0, stock: 22 },
      ],
    },
    {
      name: 'Gafas de Sol Polarizadas Unisex Classic Wayfarer',
      slug: 'gafas-de-sol-polarizadas-unisex-classic-wayfarer',
      sku: 'GFS-POL-WAY',
      shortDescription: 'Lentes polarizados con protección UV400 y montura de acetato ligero.',
      description: 'Protección total contra rayos UVA y UVB con filtro antirreflejante de alta fidelidad. Diseño atemporal que combina con cualquier outfit.',
      basePrice: 20.45,
      compareAtPrice: 35.0,
      costPrice: 7.0,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isNewArrival: true,
      categorySlug: 'relojes-accesorios',
      brandSlug: 'zara-man',
      images: [
        { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600', isMain: true, displayOrder: 0 },
      ],
      variants: [
        { sku: 'GFS-POL-BLK', title: 'Marco Negro / Lente Humo', attributes: { Color: 'Negro' }, price: 20.45, stock: 45 },
        { sku: 'GFS-POL-AMB', title: 'Marco Carei / Lente Ámbar', attributes: { Color: 'Ámbar' }, price: 20.45, stock: 25 },
      ],
    },
  ];

  for (const prodData of productsData) {
    const categoryId = categoryMap.get(prodData.categorySlug);
    const brandId = brandMap.get(prodData.brandSlug);

    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {
        name: prodData.name,
        sku: prodData.sku,
        shortDescription: prodData.shortDescription,
        description: prodData.description,
        basePrice: prodData.basePrice,
        compareAtPrice: prodData.compareAtPrice,
        costPrice: prodData.costPrice,
        status: prodData.status,
        isFeatured: prodData.isFeatured,
        isNewArrival: prodData.isNewArrival,
        categoryId,
        brandId,
      },
      create: {
        name: prodData.name,
        slug: prodData.slug,
        sku: prodData.sku,
        shortDescription: prodData.shortDescription,
        description: prodData.description,
        basePrice: prodData.basePrice,
        compareAtPrice: prodData.compareAtPrice,
        costPrice: prodData.costPrice,
        status: prodData.status,
        isFeatured: prodData.isFeatured,
        isNewArrival: prodData.isNewArrival,
        categoryId,
        brandId,
      },
    });

    // Imágenes
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const img of prodData.images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: img.url,
          isMain: img.isMain,
          displayOrder: img.displayOrder,
        },
      });
    }

    // Variantes
    for (const v of prodData.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: product.id,
          title: v.title,
          attributes: v.attributes,
          price: v.price,
          stock: v.stock,
          isActive: true,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          title: v.title,
          attributes: v.attributes,
          price: v.price,
          stock: v.stock,
          isActive: true,
        },
      });

      // Movimiento inicial de almacén si no existe
      const movementExists = await prisma.inventoryMovement.findFirst({
        where: { variantId: variant.id },
      });

      if (!movementExists) {
        await prisma.inventoryMovement.create({
          data: {
            variantId: variant.id,
            previousStock: 0,
            quantityModified: v.stock,
            newStock: v.stock,
            type: MovementType.PURCHASE,
            reason: 'Stock inicial de inventario',
            userId: adminUser.id,
          },
        });
      }
    }
  }

  // 6. CUPONES DE PRUEBA
  console.log('6. Creando Cupones...');
  await prisma.coupon.upsert({
    where: { code: 'BIENVENIDO10' },
    update: {},
    create: {
      code: 'BIENVENIDO10',
      description: '10% de descuento en tu primera compra de ropa o tenis',
      type: CouponType.PERCENTAGE,
      value: 10,
      minSpend: 50,
      maxDiscount: 100,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-12-31'),
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WALLYVIP50' },
    update: {},
    create: {
      code: 'WALLYVIP50',
      description: '$50 de descuento directo en compras mayores a $300',
      type: CouponType.FIXED_AMOUNT,
      value: 50,
      minSpend: 300,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-12-31'),
      isActive: true,
    },
  });

  console.log('✅ Seeder completado exitosamente con catálogo especializado de Moda & Accesorios.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
