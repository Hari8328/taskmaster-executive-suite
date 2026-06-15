import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Type,
  Square,
  Layers,
  ChevronRight,
  MousePointer2,
  Maximize2,
  Trash2,
  Settings2,
  Plus
} from "lucide-react";
import { cn } from "../lib/utils";
const DesignTool = () => {
  const [blocks, setBlocks] = useState([
    {
      id: "1",
      type: "text",
      content: "Editorial Layout",
      position: { x: 50, y: 50 },
      style: { fontSize: "48px", fontWeight: "bold", fontFamily: "Playfair Display" }
    },
    {
      id: "2",
      type: "card",
      content: "Feature Card",
      position: { x: 50, y: 150 },
      style: { width: "300px", height: "200px", backgroundColor: "#fdfcf9", border: "1px solid #e5e5e5" }
    }
  ]);
  const [activeTab, setActiveTab] = useState("components");
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const addBlock = (type) => {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === "text" ? "New Text" : "New Block",
      position: { x: 100, y: 100 }
    };
    setBlocks([...blocks, newBlock]);
  };
  const removeBlock = (id) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };
  return <div className="flex h-[calc(100vh-80px)] bg-editorial-paper overflow-hidden">
      {
    /* Left Toolbar */
  }
      <aside className="w-72 border-r border-editorial-border flex flex-col bg-white/50 backdrop-blur-md">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <h3 className="font-serif italic text-xl">Assets</h3>
          <div className="flex space-x-1">
            <button
    onClick={() => setActiveTab("components")}
    className={cn("p-2 rounded-sm transition-colors", activeTab === "components" ? "bg-editorial-ink text-editorial-paper" : "hover:bg-editorial-ink/5")}
  >
              <Plus size={16} />
            </button>
            <button
    onClick={() => setActiveTab("layers")}
    className={cn("p-2 rounded-sm transition-colors", activeTab === "layers" ? "bg-editorial-ink text-editorial-paper" : "hover:bg-editorial-ink/5")}
  >
              <Layers size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === "components" && <div className="grid grid-cols-2 gap-3">
              {[
    { icon: Type, label: "Heading", type: "text" },
    { icon: Square, label: "Container", type: "card" },
    { icon: MousePointer2, label: "Button", type: "button" },
    { icon: Maximize2, label: "Media", type: "image" }
  ].map((item) => <button
    key={item.label}
    onClick={() => addBlock(item.type)}
    className="flex flex-col items-center justify-center p-4 border border-editorial-border hover:border-editorial-ink transition-all group"
  >
                  <item.icon size={20} className="text-editorial-muted group-hover:text-editorial-ink mb-2" />
                  <span className="font-mono text-[10px] uppercase">{item.label}</span>
                </button>)}
            </div>}

          {activeTab === "layers" && <div className="space-y-1">
              {blocks.map((block) => <div
    key={block.id}
    onClick={() => setSelectedBlockId(block.id)}
    className={cn(
      "flex items-center justify-between p-3 border cursor-pointer transition-colors",
      selectedBlockId === block.id ? "bg-editorial-ink text-editorial-paper border-editorial-ink" : "border-transparent hover:bg-editorial-ink/5"
    )}
  >
                  <div className="flex items-center space-x-3">
                    <Layers size={14} className={selectedBlockId === block.id ? "text-editorial-accent" : "text-editorial-muted"} />
                    <span className="text-xs font-medium">{block.type.toUpperCase()} #{block.id.slice(0, 4)}</span>
                  </div>
                  <button onClick={(e) => {
    e.stopPropagation();
    removeBlock(block.id);
  }}>
                    <Trash2 size={12} className="hover:text-red-500" />
                  </button>
                </div>)}
            </div>}
        </div>
      </aside>

      {
    /* Canvas Area */
  }
      <main className="flex-1 relative bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:20px_20px] p-12 overflow-hidden">
        <div className="w-full h-full border border-editorial-border bg-white shadow-2xl relative overflow-hidden">
          <AnimatePresence>
            {blocks.map((block) => <motion.div
    key={block.id}
    drag
    dragMomentum={false}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    onClick={() => setSelectedBlockId(block.id)}
    className={cn(
      "absolute cursor-move selection:bg-transparent",
      selectedBlockId === block.id && "ring-2 ring-editorial-accent ring-offset-2"
    )}
    style={{ left: block.position.x, top: block.position.y }}
  >
                {block.type === "text" && <h2 style={block.style} className="whitespace-nowrap transition-all">
                    {block.content}
                  </h2>}
                {block.type === "card" && <div style={block.style} className="p-8 flex flex-col justify-end group">
                    <p className="font-mono text-xs uppercase text-editorial-muted">Component</p>
                    <h4 className="text-2xl font-serif">{block.content}</h4>
                  </div>}
                {block.type === "button" && <button className="bg-editorial-ink text-editorial-paper px-8 py-3 text-sm font-medium">
                    {block.content}
                  </button>}
              </motion.div>)}
          </AnimatePresence>

          {blocks.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-editorial-muted/30">
              <p className="font-serif italic text-4xl">Canvas Empty</p>
            </div>}
        </div>
      </main>

      {
    /* Right Properties Panel */
  }
      <aside className="w-80 border-l border-editorial-border flex flex-col bg-white">
        <div className="p-6 border-b border-editorial-border">
          <h3 className="font-serif italic text-xl">Properties</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {selectedBlockId ? <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-editorial-muted">Element Content</label>
                <input
    type="text"
    value={blocks.find((b) => b.id === selectedBlockId)?.content || ""}
    onChange={(e) => {
      setBlocks(blocks.map((b) => b.id === selectedBlockId ? { ...b, content: e.target.value } : b));
    }}
    className="w-full border-b border-editorial-border py-2 focus:border-editorial-ink outline-none transition-colors"
  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-editorial-muted">X Position</label>
                  <input type="number" className="w-full border-b border-editorial-border py-1 outline-none font-mono text-xs" defaultValue={50} />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-editorial-muted">Y Position</label>
                  <input type="number" className="w-full border-b border-editorial-border py-1 outline-none font-mono text-xs" defaultValue={50} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-editorial-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Visual Styles</span>
                  <Settings2 size={14} className="text-editorial-muted" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-sm">
                    <span className="text-xs">Typography</span>
                    <ChevronRight size={14} />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-sm">
                    <span className="text-xs">Color/Fill</span>
                    <div className="w-4 h-4 bg-editorial-ink rounded-full" />
                  </div>
                </div>
              </div>
            </div> : <div className="h-full flex items-center justify-center text-editorial-muted text-sm italic">
              Select an element to edit
            </div>}
        </div>
      </aside>
    </div>;
};
export default DesignTool;
