import {
  LayoutGrid,
  Map,
  List,
  Video,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Users,
  Building2,
  Compass,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Bell,
  CheckCheck,
  AlertTriangle,
  CircleAlert,
  MapPin,
} from 'lucide-react'

const iconComponents = {
  overview: LayoutGrid,
  map: Map,
  list: List,
  video: Video,
  search: Search,
  back: ChevronLeft,
  arrow: ChevronRight,
  chevronDown: ChevronDown,
  expand: ExternalLink,
  users: Users,
  departments: Building2,
  patrol: Compass,
  admin: Shield,
  sidebarCollapse: PanelLeftClose,
  sidebarExpand: PanelLeftOpen,
  logout: LogOut,
  notifications: Bell,
  checkAll: CheckCheck,
  alert: AlertTriangle,
  near: CircleAlert,
  pin: MapPin,
}

export default function UserIcon({ name, size = 20, className = '' }) {
  const Component = iconComponents[name]
  if (!Component) return null
  return <Component size={size} className={className} strokeWidth={1.7} aria-hidden="true" />
}
