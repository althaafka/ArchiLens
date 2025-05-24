import { useState } from "react"

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

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function AppSidebar({
  onUpload,
  onRelayout,
  selectedLayout,
  setSelectedLayout,
}: {
  onUpload: (data:any) => void
  onRelayout?: (layout: string) => void
  selectedLayout: string
  setSelectedLayout: (layout: string) => void
}) {

  return (
    <Sidebar collapsible="none" className="w-64 min-w-64">
      <div className="px-4 py-3 border-b">
        <h1 className="text-lg font-semibold tracking-tight">ArchiLens</h1>
      </div>

      <SidebarContent>
        <Tabs defaultValue="general" className="px-4 py-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="edges">Edges</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-2">
          <div className="grid w-full max-w-sm items-center gap-2">
              <Label className="text-m" htmlFor="file-upload">Upload Graph</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                className="cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        console.log("Loaded graph data:", data);
                        onUpload(data);
                      } catch (error) {
                        console.error("Failed to parse JSON:", error);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="layout-select">Select Layout</Label>
              <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                <SelectTrigger id="layout-select">
                  <SelectValue placeholder="Select layout..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="cola">Cola</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="mt-2"
                variant="default"
                onClick={() => {
                  if (selectedLayout) {
                    onRelayout?.(selectedLayout)
                  }
                }}
              >
                Relayout
              </Button>
            </div>
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