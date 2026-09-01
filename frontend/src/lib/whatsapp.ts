import { CartItem } from '../types/index';
import { formatCurrency } from './utils';
import { getStoredOrders, saveOrdersStore, getStoredProducts, saveProductsCatalog } from './catalogStore';

export const DEFAULT_WHATSAPP_NUMBER = '18299793111'; // Luxora Style WhatsApp: 829-979-3111

export function formatWhatsAppNumberForLink(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/[^0-9]/g, '');
  if (!cleaned) return DEFAULT_WHATSAPP_NUMBER;

  if (cleaned.length === 10 && (cleaned.startsWith('809') || cleaned.startsWith('829') || cleaned.startsWith('849'))) {
    cleaned = `1${cleaned}`;
  }

  return cleaned;
}

export function formatWhatsAppNumberDisplay(phoneNumber: string): string {
  const cleaned = formatWhatsAppNumberForLink(phoneNumber);
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return `+${cleaned}`;
}

export function getStoreWhatsAppNumber(): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('luxora_whatsapp_number');
      if (saved && saved.trim()) {
        return formatWhatsAppNumberForLink(saved);
      }
    } catch (e) {}
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

export function setStoreWhatsAppNumber(phoneNumber: string): void {
  if (typeof window !== 'undefined') {
    try {
      const formatted = formatWhatsAppNumberForLink(phoneNumber);
      localStorage.setItem('luxora_whatsapp_number', formatted);
    } catch (e) {}
  }
}

export function generateWhatsAppOrderMessage(
  items: CartItem[],
  subtotal: number,
  shippingCost: number,
  tax: number,
  total: number,
  discount: number = 0,
  couponCode?: string,
  customerData?: { name?: string; phone?: string; address?: string; city?: string },
  orderId?: string,
  orderNumber?: string
): string {
  const dateStr = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const confirmationLink = `${baseUrl}/admin/orders/confirm?id=${orderId || 'ord-latest'}`;

  let message = `🛍️ *NUEVO PEDIDO - LUXORA STYLE*\n`;
  if (orderNumber) {
    message += `🔖 *Orden:* \`${orderNumber}\`\n`;
  }
  message += `📅 _${dateStr}_\n\n`;

  if (customerData?.name) {
    message += `👤 *DATOS DEL CLIENTE:*\n`;
    message += `• Nombre: ${customerData.name}\n`;
    if (customerData.phone) message += `• Teléfono: ${customerData.phone}\n`;
    if (customerData.address) message += `• Dirección: ${customerData.address}, ${customerData.city || ''}\n`;
    message += `\n`;
  }

  message += `📦 *PRODUCTOS SELECCIONADOS (${items.length}):*\n`;
  message += `──────────────────────\n`;

  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    message += `*${index + 1}. ${item.productName}*\n`;
    message += `   • Opción / Talla: ${item.title}\n`;
    message += `   • SKU: ${item.sku}\n`;
    message += `   • Cantidad: ${item.quantity} ud(s).\n`;
    message += `   • Precio: ${formatCurrency(item.price)} c/u\n`;
    message += `   • Subtotal: ${formatCurrency(itemTotal)}\n\n`;
  });

  message += `──────────────────────\n`;
  message += `💰 *RESUMEN DEL PEDIDO:*\n`;
  message += `• Subtotal: ${formatCurrency(subtotal)}\n`;

  if (discount > 0) {
    message += `• Descuento ${couponCode ? `(${couponCode})` : ''}: -${formatCurrency(discount)}\n`;
  }

  message += `• Envío: ${shippingCost === 0 ? 'GRATIS' : formatCurrency(shippingCost)}\n`;
  message += `• Impuestos (18% ITBIS): ${formatCurrency(tax)}\n`;
  message += `• *TOTAL A PAGAR: ${formatCurrency(total)}*\n\n`;

  message += `📍 *Hola Luxora Style, deseo coordinar el pago y entrega de este pedido.*\n\n`;
  message += `──────────────────────\n`;
  message += `⚡ *PANEL DE CONTROL LUXORA (Admin):*\n`;
  message += `🔗 *Link para Confirmar o Cancelar Venta:*\n`;
  message += `👉 ${confirmationLink}`;

  return message;
}

export function openWhatsAppOrder(
  items: CartItem[],
  subtotal: number,
  shippingCost: number,
  tax: number,
  total: number,
  discount: number = 0,
  couponCode?: string,
  customerData?: { name?: string; phone?: string; address?: string; city?: string }
): { orderId: string; orderNumber: string } {
  const number = getStoreWhatsAppNumber();
  const timestamp = Date.now();
  const orderId = `ord-${timestamp}`;
  const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${timestamp.toString().slice(-4)}`;

  // Save new order as PENDING_CONFIRMATION in local store immediately
  try {
    const existingOrders = getStoredOrders();
    const newOrder = {
      id: orderId,
      orderNumber,
      customerName: customerData?.name || 'Cliente WhatsApp',
      email: customerData?.phone ? `${customerData.phone}@whatsapp.cliente` : 'cliente@luxorastyle.com',
      phone: customerData?.phone || '',
      itemsCount: items.reduce((acc, i) => acc + i.quantity, 0),
      itemsDescription: items.map((i) => `${i.productName} (${i.title}) x${i.quantity}`).join(', '),
      items: items.map((i) => ({
        id: i.variantId,
        variantId: i.variantId,
        productId: i.productId,
        productName: i.productName,
        title: i.title,
        sku: i.sku,
        price: i.price,
        quantity: i.quantity,
        imageUrl: i.imageUrl,
      })),
      createdAt: new Date().toISOString(),
      grandTotal: Number(total),
      subtotal: Number(subtotal),
      discount: Number(discount),
      couponCode: couponCode || null,
      shippingCost: Number(shippingCost),
      tax: Number(tax),
      paymentMethod: 'WhatsApp Directo / Transferencia',
      paymentStatus: 'Pendiente de Confirmación',
      status: 'PENDING_CONFIRMATION',
      carrier: 'Envío Local',
      trackingNumber: '',
      shippingAddress: customerData?.address ? `${customerData.address}, ${customerData.city || ''}` : 'Entrega acordada por WhatsApp',
    };

    saveOrdersStore([newOrder, ...existingOrders]);
  } catch (e) {
    console.error('Error saving WhatsApp order:', e);
  }

  const message = generateWhatsAppOrderMessage(
    items,
    subtotal,
    shippingCost,
    tax,
    total,
    discount,
    couponCode,
    customerData,
    orderId,
    orderNumber
  );

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${number}?text=${encodedMessage}`;

  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }

  return { orderId, orderNumber };
}
