import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"

import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
  } from "@/components/ui/tabs"

export function AppSidebar() {
  return (
    <Sidebar collapsible="none" className="w-64 min-w-64">
      <div className="px-4 py-3 border-b">
        <h1 className="text-lg font-semibold tracking-tight">ArchiLens</h1>
      </div>

      <SidebarContent>
        <Tabs defaultValue="general" className="p-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="edges">Edges</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-2 space-y-2">
          </TabsContent>

          <TabsContent value="nodes" className="mt-2 space-y-2">
          </TabsContent>

          <TabsContent value="edges" className="mt-2 space-y-2">
          </TabsContent>
        </Tabs>
      </SidebarContent>
    </Sidebar>
  )
}