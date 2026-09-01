import { CartItem } from '../types';
import { formatCurrency } from './utils';

export const DEFAULT_WHATSAPP_NUMBER = '18095550199'; // Default store WhatsApp number

export function getStoreWhatsAppNumber(): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('luxora_whatsapp_number');
      if (saved && saved.trim()) {
        return saved.replace(/[^0-9]/g, '');
      }
    } catch (e) {}
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

export function setStoreWhatsAppNumber(phoneNumber: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('luxora_whatsapp_number', phoneNumber.replace(/[^0-9]/g, ''));
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
  customerData?: { name?: string; phone?: string; address?: string; city?: string }
): string {
  const dateStr = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `🛍️ *NUEVO PEDIDO - LUXORA STYLE*\n`;
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

  message += `📍 *Hola Luxora Style, deseo confirmar y coordinar el pago y envío de este pedido.*`;

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
): void {
  const number = getStoreWhatsAppNumber();
  const message = generateWhatsAppOrderMessage(
    items,
    subtotal,
    shippingCost,
    tax,
    total,
    discount,
    couponCode,
    customerData
  );

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${number}?text=${encodedMessage}`;

  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }
}
