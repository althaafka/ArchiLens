import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { useEffect, useRef, useState } from "react"
import { StylesheetCSS } from "cytoscape";
import styleData from "../cy-style.json";
import rawGraph from "../assets/jhotdraw_abstract.json"
const style: StylesheetCSS[] = styleData as unknown as StylesheetCSS[];
import cytoscape from "cytoscape";
import cola from "cytoscape-cola"

cytoscape.use(cola)

import { GraphManager } from "@/core/GraphManager";
import GraphBuilder from "@/core/GraphBuilder";
import HeadlessProcessor from "@/core/HeadlessProcessor";

export default function MainLayout() {
    const cyRef = useRef<HTMLDivElement>(null)
    const graphManagerRef = useRef<GraphManager | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedLayout, setSelectedLayout] = useState("grid")

    const handleUploadGraph = (rawJson: any) => {
      const elements = GraphBuilder.buildGraph(rawJson.elements);
      const gm = graphManagerRef.current;
      if (!gm) return;
    
      gm.resetGraph(elements);
      setSelectedLayout("grid"); 
    
      gm.getInstance().ready(() => {
        const processor = new HeadlessProcessor(gm.getInstance());
        processor.process();
      });
    }

    const handleRelayout = (layout: string) => {
      graphManagerRef.current?.getInstance().layout({ name: layout }).run()
    }
    

    useEffect(() => {
        if (!cyRef.current) return
    
        const elements = GraphBuilder.buildGraph(rawGraph.elements)
        const gm = new GraphManager(cyRef.current, elements, style);
        graphManagerRef.current = gm

        gm.getInstance().ready(() => {
          gm.getInstance().layout({ name: "grid" }).run()

          const processor = new HeadlessProcessor(gm.getInstance());
          processor.process();
          setIsLoading(false)
        })
    
        return () => {
          gm.destroy()
        }
    }, [])

    return (
      <SidebarProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <AppSidebar 
            onUpload={handleUploadGraph}
            onRelayout={handleRelayout}
            selectedLayout={selectedLayout}
            setSelectedLayout={setSelectedLayout}
          />
          <main className="flex-1 relative flex h-full w-full">
            {isLoading && (
              <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
                <span className="text-gray-600 text-sm animate-pulse">Loading graph...</span>
              </div>
            )}
            <div ref={cyRef} id="cy" className="h-full w-full bg-white" />
          </main>
        </div>
      </SidebarProvider>
    )
}