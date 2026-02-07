import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, FileJson, File } from "lucide-react"
import { TicketResponse } from "@/services/apiService"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface ExportButtonProps {
  data: TicketResponse[]
  filename?: string
  className?: string
}

export function ExportButton({ data, filename = "tickets", className }: ExportButtonProps) {
  const exportToCSV = () => {
    const headers = ["Numero", "Description", "Statut", "Categorie", "Technicien", "Date creation", "Urgent"]
    const rows = data.map((ticket) => [
      ticket.ticketNumber,
      ticket.description,
      ticket.status,
      ticket.categoryName,
      ticket.assignedTechnicianName || "-",
      ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("fr-FR") : "-",
      ticket.isUrgent ? "Oui" : "Non",
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((ticket) => ({
        Numero: ticket.ticketNumber,
        Description: ticket.description,
        Statut: ticket.status,
        Categorie: ticket.categoryName,
        Technicien: ticket.assignedTechnicianName || "-",
        "Date creation": ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("fr-FR") : "-",
        Urgent: ticket.isUrgent ? "Oui" : "Non",
        "Email client": ticket.clientEmail,
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets")
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Liste des Tickets", 14, 22)

    const tableData = data.map((ticket) => [
      ticket.ticketNumber,
      ticket.description.substring(0, 50) + (ticket.description.length > 50 ? "..." : ""),
      ticket.status,
      ticket.categoryName,
      ticket.assignedTechnicianName || "-",
      ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("fr-FR") : "-",
    ])

    ;(doc as any).autoTable({
      head: [["Numero", "Description", "Statut", "Categorie", "Technicien", "Date"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 16, 102] }, // Navy color
    })

    doc.save(`${filename}.pdf`)
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.json`
    link.click()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Format d'export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="h-4 w-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <File className="h-4 w-4 mr-2" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

