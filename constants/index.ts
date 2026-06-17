import type { PropertyType, DealType, PropertyStatus } from "../types";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Kvartira',
  house: 'Hovli',
  cottage: 'Kotej',
  dacha: 'Dacha',
  commercial: 'Tijorat binolari',
  land: 'Yer',
}

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  daily: 'Kunlik',
  sale: 'Sotiladi',
  rent: 'Ijara',
  installment: 'Nasiya',
}

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  ready: 'Tayyor uy',
  'half-ready': 'Yarim tayyor',
  land: 'Tekis yer',
}
