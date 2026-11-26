import {
  LayoutGrid,
  Map,
  List,
  Video,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
  Building2,
} from 'lucide-react'

const iconComponents = {
  overview: LayoutGrid,
  map: Map,
  list: List,
  video: Video,
  search: Search,
  back: ChevronLeft,
  arrow: ChevronRight,
  expand: ExternalLink,
  users: Users,
  departments: Building2,
}

export default function UserIcon({ name, size = 20, className = '' }) {
  const Component = iconComponents[name]
  if (!Component) return null
  return <Component size={size} className={className} strokeWidth={1.7} aria-hidden="true" />
}
