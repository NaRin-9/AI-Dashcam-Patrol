import {
  LayoutGrid,
  Map,
  List,
  Video,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
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
}

export default function UserIcon({ name, size = 20, className = '' }) {
  const Component = iconComponents[name]
  if (!Component) return null
  return <Component size={size} className={className} strokeWidth={1.7} aria-hidden="true" />
}
