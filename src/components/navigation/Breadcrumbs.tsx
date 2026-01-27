import { useLocation, Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, Ticket, Users, Building2, Settings, FileText, CreditCard, BarChart3 } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

const routeMap: Record<string, BreadcrumbItem> = {
  "/dashboard": { label: "Dashboard", icon: <Home className="h-4 w-4" /> },
  "/dashboard/admin": { label: "Dashboard Admin", icon: <Home className="h-4 w-4" /> },
  "/dashboard/technician": { label: "Dashboard Technicien", icon: <Home className="h-4 w-4" /> },
  "/dashboard/client": { label: "Mes Tickets", icon: <Home className="h-4 w-4" /> },
  "/dashboard/superadmin": { label: "Dashboard Super Admin", icon: <Home className="h-4 w-4" /> },
  "/tickets": { label: "Tickets", icon: <Ticket className="h-4 w-4" /> },
  "/technicians": { label: "Techniciens", icon: <Users className="h-4 w-4" /> },
  "/hotels": { label: "Hôtels", icon: <Building2 className="h-4 w-4" /> },
  "/payments": { label: "Paiements", icon: <CreditCard className="h-4 w-4" /> },
  "/reports": { label: "Rapports", icon: <BarChart3 className="h-4 w-4" /> },
  "/settings": { label: "Paramètres", icon: <Settings className="h-4 w-4" /> },
  "/categories": { label: "Catégories", icon: <FileText className="h-4 w-4" /> },
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []
    let currentPath = ""

    // Always start with home
    breadcrumbs.push({
      label: "Accueil",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    })

    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`
      const isLast = index === pathnames.length - 1

      // Check if we have a route mapping
      const routeInfo = routeMap[currentPath]
      if (routeInfo) {
        breadcrumbs.push({
          label: routeInfo.label,
          href: isLast ? undefined : currentPath,
          icon: routeInfo.icon,
        })
      } else {
        // Fallback: capitalize and format the pathname
        const label = pathname
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath,
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = buildBreadcrumbs()

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <React.Fragment key={crumb.href || crumb.label}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {crumb.icon}
                    <span>{crumb.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href || "#"} className="flex items-center gap-2">
                      {crumb.icon}
                      <span>{crumb.label}</span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

