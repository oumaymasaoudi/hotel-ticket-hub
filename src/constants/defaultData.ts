import { Plan, Category } from "@/services/apiService";

/**
 * Plans d'abonnement par défaut
 * Ces valeurs sont utilisées si la base de données est vide
 */
export const DEFAULT_PLANS: Plan[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "BASIC",
    baseCost: 49.99,
    ticketQuota: 50,
    excessTicketCost: 2.50,
    maxTechnicians: 2,
    slaHours: 24,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "PRO",
    baseCost: 99.99,
    ticketQuota: 150,
    excessTicketCost: 2.00,
    maxTechnicians: 5,
    slaHours: 12,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "ENTERPRISE",
    baseCost: 199.99,
    ticketQuota: 500,
    excessTicketCost: 1.50,
    maxTechnicians: 15,
    slaHours: 6,
  },
];

/**
 * Catégories par défaut
 * Ces valeurs sont utilisées si la base de données est vide
 */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "650e8400-e29b-41d4-a716-446655440001",
    name: "Électricité",
    icon: "Zap",
    color: "#FF6B6B",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440002",
    name: "Plomberie",
    icon: "Droplet",
    color: "#4ECDC4",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440003",
    name: "Climatisation",
    icon: "Snowflake",
    color: "#95E1D3",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440004",
    name: "WiFi/Internet",
    icon: "Wifi",
    color: "#A8E6CF",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440005",
    name: "Serrurerie",
    icon: "Key",
    color: "#FFD93D",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440006",
    name: "Mobilier",
    icon: "BedDouble",
    color: "#F38181",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440007",
    name: "Sanitaires",
    icon: "Bath",
    color: "#6C5CE7",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440008",
    name: "Insonorisation",
    icon: "Volume2",
    color: "#74B9FF",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440009",
    name: "Nettoyage",
    icon: "Sparkles",
    color: "#A29BFE",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440010",
    name: "Sécurité",
    icon: "Shield",
    color: "#FD79A8",
    isMandatory: true,
    additionalCost: 25,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440011",
    name: "Restauration",
    icon: "UtensilsCrossed",
    color: "#FDCB6E",
    isMandatory: false,
    additionalCost: 0,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440012",
    name: "Approvisionnement",
    icon: "Package",
    color: "#00B894",
    isMandatory: false,
    additionalCost: 0,
  },
];

