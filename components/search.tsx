import { Label } from './ui/label'
import { SidebarGroup, SidebarGroupContent, SidebarInput } from './ui/sidebar'

export function Search() {
  return (
    <form>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search the docs..."
            className="pl-4"
          />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
