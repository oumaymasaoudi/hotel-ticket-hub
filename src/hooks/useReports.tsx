import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  pending: number;
  resolved: number;
  closed: number;
  escalated: number;
}

interface TechnicianPerformance {
  id: string;
  name: string;
  tickets_assigned: number;
  tickets_resolved: number;
  avg_resolution_time: string;
}

interface HotelReport {
  id: string;
  name: string;
  plan: string;
  tickets_total: number;
  tickets_resolved: number;
  sla_compliance: number;
}

interface CategoryStats {
  name: string;
  color: string;
  count: number;
}

export const useReports = () => {
  const [loading, setLoading] = useState(false);

  const fetchAdminReportData = async (hotelId: string) => {
    // Fetch tickets for this hotel
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*, categories(name, color), profiles!tickets_assigned_technician_id_fkey(full_name)')
      .eq('hotel_id', hotelId);

    // Fetch technicians for this hotel
    const { data: technicians } = await supabase
      .from('user_roles')
      .select('user_id, profiles(id, full_name)')
      .eq('hotel_id', hotelId)
      .eq('role', 'technician');

    // Calculate stats
    const ticketStats: TicketStats = {
      total: tickets?.length || 0,
      open: tickets?.filter(t => t.status === 'open').length || 0,
      in_progress: tickets?.filter(t => t.status === 'in_progress').length || 0,
      pending: tickets?.filter(t => t.status === 'pending').length || 0,
      resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
      closed: tickets?.filter(t => t.status === 'closed').length || 0,
      escalated: tickets?.filter(t => t.status === 'pending' && t.assigned_technician_id === null).length || 0,
    };

    // Calculate technician performance
    const techPerformance: TechnicianPerformance[] = (technicians || []).map(tech => {
      const techTickets = tickets?.filter(t => t.assigned_technician_id === tech.user_id) || [];
      const resolvedTickets = techTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
      
      return {
        id: tech.user_id,
        name: tech.profiles?.full_name || 'Unknown',
        tickets_assigned: techTickets.length,
        tickets_resolved: resolvedTickets.length,
        avg_resolution_time: resolvedTickets.length > 0 ? '~24h' : 'N/A',
      };
    });

    // Category breakdown
    const categoryStats: CategoryStats[] = [];
    tickets?.forEach(ticket => {
      const existing = categoryStats.find(c => c.name === ticket.categories?.name);
      if (existing) {
        existing.count++;
      } else if (ticket.categories) {
        categoryStats.push({
          name: ticket.categories.name,
          color: ticket.categories.color,
          count: 1,
        });
      }
    });

    return { ticketStats, techPerformance, categoryStats, tickets };
  };

  const fetchSuperAdminReportData = async () => {
    // Fetch all hotels with plans
    const { data: hotels } = await supabase
      .from('hotels')
      .select('*, plans(name, base_cost)');

    // Fetch all tickets
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*, categories(name, color), hotels(name)');

    // Fetch all categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    // Hotel reports
    const hotelReports: HotelReport[] = (hotels || []).map(hotel => {
      const hotelTickets = tickets?.filter(t => t.hotel_id === hotel.id) || [];
      const resolvedTickets = hotelTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
      const slaCompliant = hotelTickets.filter(t => {
        if (!t.sla_deadline || !t.resolved_at) return false;
        return new Date(t.resolved_at) <= new Date(t.sla_deadline);
      });

      return {
        id: hotel.id,
        name: hotel.name,
        plan: hotel.plans?.name || 'Unknown',
        tickets_total: hotelTickets.length,
        tickets_resolved: resolvedTickets.length,
        sla_compliance: hotelTickets.length > 0 
          ? Math.round((slaCompliant.length / hotelTickets.length) * 100) 
          : 100,
      };
    });

    // Global stats
    const globalStats: TicketStats = {
      total: tickets?.length || 0,
      open: tickets?.filter(t => t.status === 'open').length || 0,
      in_progress: tickets?.filter(t => t.status === 'in_progress').length || 0,
      pending: tickets?.filter(t => t.status === 'pending').length || 0,
      resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
      closed: tickets?.filter(t => t.status === 'closed').length || 0,
      escalated: tickets?.filter(t => t.status === 'pending' && !t.assigned_technician_id).length || 0,
    };

    // Category stats
    const categoryStats: CategoryStats[] = (categories || []).map(cat => ({
      name: cat.name,
      color: cat.color,
      count: tickets?.filter(t => t.category_id === cat.id).length || 0,
    }));

    // Revenue calculation
    const totalRevenue = (hotels || []).reduce((sum, h) => sum + (h.plans?.base_cost || 0), 0);

    return { hotelReports, globalStats, categoryStats, totalRevenue, hotels, tickets };
  };

  const generateAdminPDF = async (hotelId: string, hotelName: string) => {
    setLoading(true);
    try {
      const { ticketStats, techPerformance, categoryStats } = await fetchAdminReportData(hotelId);
      
      const doc = new jsPDF();
      const now = format(new Date(), 'dd MMMM yyyy', { locale: fr });
      
      // Header
      doc.setFontSize(20);
      doc.text(`Rapport Mensuel - ${hotelName}`, 20, 20);
      doc.setFontSize(10);
      doc.text(`Généré le ${now}`, 20, 30);
      
      // Ticket Statistics
      doc.setFontSize(14);
      doc.text('Statistiques des Tickets', 20, 45);
      doc.setFontSize(10);
      doc.text(`Total: ${ticketStats.total}`, 25, 55);
      doc.text(`Ouverts: ${ticketStats.open}`, 25, 62);
      doc.text(`En cours: ${ticketStats.in_progress}`, 25, 69);
      doc.text(`En attente: ${ticketStats.pending}`, 25, 76);
      doc.text(`Résolus: ${ticketStats.resolved}`, 25, 83);
      doc.text(`Fermés: ${ticketStats.closed}`, 25, 90);
      doc.text(`Escaladés: ${ticketStats.escalated}`, 25, 97);
      
      // Technician Performance
      doc.setFontSize(14);
      doc.text('Performance des Techniciens', 20, 115);
      doc.setFontSize(10);
      let yPos = 125;
      techPerformance.forEach(tech => {
        doc.text(`${tech.name}: ${tech.tickets_resolved}/${tech.tickets_assigned} résolus`, 25, yPos);
        yPos += 7;
      });
      
      // Category Breakdown
      doc.setFontSize(14);
      doc.text('Répartition par Catégorie', 20, yPos + 15);
      doc.setFontSize(10);
      yPos += 25;
      categoryStats.forEach(cat => {
        doc.text(`${cat.name}: ${cat.count} tickets`, 25, yPos);
        yPos += 7;
      });
      
      doc.save(`rapport-${hotelName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM')}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  const generateAdminExcel = async (hotelId: string, hotelName: string) => {
    setLoading(true);
    try {
      const { ticketStats, techPerformance, categoryStats, tickets } = await fetchAdminReportData(hotelId);
      
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['Statistiques des Tickets', ''],
        ['Total', ticketStats.total],
        ['Ouverts', ticketStats.open],
        ['En cours', ticketStats.in_progress],
        ['En attente', ticketStats.pending],
        ['Résolus', ticketStats.resolved],
        ['Fermés', ticketStats.closed],
        ['Escaladés', ticketStats.escalated],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Résumé');
      
      // Technicians sheet
      const techData = [
        ['Technicien', 'Tickets Assignés', 'Tickets Résolus', 'Temps Moyen'],
        ...techPerformance.map(t => [t.name, t.tickets_assigned, t.tickets_resolved, t.avg_resolution_time])
      ];
      const techSheet = XLSX.utils.aoa_to_sheet(techData);
      XLSX.utils.book_append_sheet(wb, techSheet, 'Techniciens');
      
      // Tickets detail sheet
      const ticketsData = [
        ['Numéro', 'Catégorie', 'Statut', 'Date Création', 'Email Client'],
        ...(tickets || []).map(t => [
          t.ticket_number,
          t.categories?.name || '',
          t.status,
          format(new Date(t.created_at), 'dd/MM/yyyy HH:mm'),
          t.client_email
        ])
      ];
      const ticketsSheet = XLSX.utils.aoa_to_sheet(ticketsData);
      XLSX.utils.book_append_sheet(wb, ticketsSheet, 'Tickets');
      
      XLSX.writeFile(wb, `rapport-${hotelName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM')}.xlsx`);
    } finally {
      setLoading(false);
    }
  };

  const generateSuperAdminPDF = async (reportType: 'monthly' | 'sla' | 'hotel') => {
    setLoading(true);
    try {
      const { hotelReports, globalStats, categoryStats, totalRevenue } = await fetchSuperAdminReportData();
      
      const doc = new jsPDF();
      const now = format(new Date(), 'dd MMMM yyyy', { locale: fr });
      
      if (reportType === 'monthly') {
        doc.setFontSize(20);
        doc.text('Rapport Mensuel Global', 20, 20);
        doc.setFontSize(10);
        doc.text(`Généré le ${now}`, 20, 30);
        
        doc.setFontSize(14);
        doc.text('Statistiques Globales', 20, 45);
        doc.setFontSize(10);
        doc.text(`Total tickets: ${globalStats.total}`, 25, 55);
        doc.text(`Résolus: ${globalStats.resolved + globalStats.closed}`, 25, 62);
        doc.text(`En attente: ${globalStats.pending + globalStats.open + globalStats.in_progress}`, 25, 69);
        doc.text(`Escaladés: ${globalStats.escalated}`, 25, 76);
        
        doc.setFontSize(14);
        doc.text('Par Catégorie', 20, 95);
        doc.setFontSize(10);
        let yPos = 105;
        categoryStats.forEach(cat => {
          doc.text(`${cat.name}: ${cat.count}`, 25, yPos);
          yPos += 7;
        });
        
        doc.save(`rapport-global-${format(new Date(), 'yyyy-MM')}.pdf`);
      } else if (reportType === 'sla') {
        doc.setFontSize(20);
        doc.text('Rapport SLA', 20, 20);
        doc.setFontSize(10);
        doc.text(`Généré le ${now}`, 20, 30);
        
        doc.setFontSize(14);
        doc.text('Conformité SLA par Hôtel', 20, 45);
        doc.setFontSize(10);
        let yPos = 55;
        hotelReports.forEach(hotel => {
          doc.text(`${hotel.name} (${hotel.plan}): ${hotel.sla_compliance}%`, 25, yPos);
          yPos += 7;
        });
        
        doc.save(`rapport-sla-${format(new Date(), 'yyyy-MM')}.pdf`);
      } else if (reportType === 'hotel') {
        doc.setFontSize(20);
        doc.text('Rapport par Hôtel', 20, 20);
        doc.setFontSize(10);
        doc.text(`Généré le ${now}`, 20, 30);
        
        let yPos = 45;
        hotelReports.forEach(hotel => {
          doc.setFontSize(12);
          doc.text(hotel.name, 20, yPos);
          doc.setFontSize(10);
          doc.text(`Plan: ${hotel.plan}`, 25, yPos + 7);
          doc.text(`Tickets: ${hotel.tickets_total} (${hotel.tickets_resolved} résolus)`, 25, yPos + 14);
          doc.text(`SLA: ${hotel.sla_compliance}%`, 25, yPos + 21);
          yPos += 35;
        });
        
        doc.save(`rapport-hotels-${format(new Date(), 'yyyy-MM')}.pdf`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSuperAdminExcel = async () => {
    setLoading(true);
    try {
      const { hotelReports, globalStats, categoryStats, totalRevenue, tickets } = await fetchSuperAdminReportData();
      
      const wb = XLSX.utils.book_new();
      
      // Summary
      const summaryData = [
        ['Statistiques Globales', ''],
        ['Total Tickets', globalStats.total],
        ['Résolus', globalStats.resolved + globalStats.closed],
        ['En cours', globalStats.in_progress],
        ['Ouverts', globalStats.open],
        ['En attente', globalStats.pending],
        ['Escaladés', globalStats.escalated],
        ['', ''],
        ['Revenus Mensuels', `${totalRevenue}€`],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Résumé');
      
      // Hotels
      const hotelsData = [
        ['Hôtel', 'Plan', 'Tickets', 'Résolus', 'SLA %'],
        ...hotelReports.map(h => [h.name, h.plan, h.tickets_total, h.tickets_resolved, h.sla_compliance])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hotelsData), 'Hôtels');
      
      // Categories
      const catData = [
        ['Catégorie', 'Nombre de Tickets'],
        ...categoryStats.map(c => [c.name, c.count])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(catData), 'Catégories');
      
      // All tickets
      const ticketsData = [
        ['Numéro', 'Hôtel', 'Catégorie', 'Statut', 'Date'],
        ...(tickets || []).map(t => [
          t.ticket_number,
          t.hotels?.name || '',
          t.categories?.name || '',
          t.status,
          format(new Date(t.created_at), 'dd/MM/yyyy')
        ])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ticketsData), 'Tous les Tickets');
      
      XLSX.writeFile(wb, `rapport-financier-${format(new Date(), 'yyyy-MM')}.xlsx`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateAdminPDF,
    generateAdminExcel,
    generateSuperAdminPDF,
    generateSuperAdminExcel,
  };
};
