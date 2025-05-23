import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { useEffect, useRef } from "react"
import cytoscape from "cytoscape"
import { StylesheetCSS } from "cytoscape";
import styleData from "../cy-style.json";
import rawGraph from "../assets/jhotdraw_abstract.json"
const style: StylesheetCSS[] = styleData as unknown as StylesheetCSS[];

export default function MainLayout() {
    const cyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!cyRef.current) return
    
        const cy = cytoscape({
          container: cyRef.current,
          elements: rawGraph.elements,
          style: style,
          layout: { name: 'grid' }
        })

        // cy.fit();

        // window.addEventListener('resize', () => cy.fit());
    
        return () => {
        //   window.removeEventListener('resize', () => cy.fit());
          cy.destroy();
        }
    }, [])

    return (
      <SidebarProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <AppSidebar/>
          <main className="flex-1 relative flex h-full w-full">
            <div ref={cyRef} id="cy" className="h-full w-full bg-white" />
          </main>
        </div>
      </SidebarProvider>
    )
}