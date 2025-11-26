"use client";

import { useState, useMemo } from "react";

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface MousePosition {
  x: number;
  y: number;
}

interface ItemPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

type LayoutConfig = {
  [itemId: string]: ItemPosition;
};

export function CustomerShowcase({ items }: { items: ShowcaseItem[] }) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  // Grid cell dimensions
  const cellWidth = 236;
  const cellHeight = 160;
  const gapX = 16;
  const gapY = 12;

  // Helper function to convert grid position to absolute position
  const getPosition = (
    col: number,
    row: number,
    colSpan: number,
    rowSpan: number
  ): ItemPosition => ({
    x: col * (cellWidth + gapX),
    y: row * (cellHeight + gapY),
    width: colSpan * cellWidth + (colSpan - 1) * gapX,
    height: rowSpan * cellHeight + (rowSpan - 1) * gapY,
  });

  // 7 predefined layout configurations - one for each item being the featured (2x2) item
  const layoutConfigurations: { [key: string]: LayoutConfig } = {
    // Default state - item 1 is featured
    default: {
      "1": getPosition(0, 0, 2, 2), // Top-left 2x2
      "2": getPosition(2, 0, 1, 2), // Right side 1x2
      "3": getPosition(3, 0, 1, 1), // Top-right 1x1
      "4": getPosition(3, 1, 1, 1), // Middle-right 1x1
      "5": getPosition(0, 2, 1, 1), // Bottom-left 1x1
      "6": getPosition(1, 2, 1, 1), // Bottom-middle 1x1
      "7": getPosition(2, 2, 2, 1), // Bottom 2x1
    },
    // When item 1 is hovered
    "1": {
      "1": getPosition(0, 0, 2, 2),
      "2": getPosition(2, 0, 1, 2),
      "3": getPosition(3, 0, 1, 1),
      "4": getPosition(3, 1, 1, 1),
      "5": getPosition(0, 2, 1, 1),
      "6": getPosition(1, 2, 1, 1),
      "7": getPosition(2, 2, 2, 1),
    },
    // When item 2 is hovered
    "2": {
      "1": getPosition(0, 0, 1, 2),
      "2": getPosition(1, 0, 2, 2),
      "3": getPosition(3, 0, 1, 1),
      "4": getPosition(3, 1, 1, 1),
      "5": getPosition(0, 2, 1, 1),
      "6": getPosition(1, 2, 1, 1),
      "7": getPosition(2, 2, 2, 1),
    },
    // When item 3 is hovered
    "3": {
      "1": getPosition(0, 0, 1, 1),
      "2": getPosition(1, 0, 1, 1),
      "3": getPosition(2, 0, 2, 2),
      "4": getPosition(1, 1, 1, 1),
      "5": getPosition(0, 1, 1, 2),
      "6": getPosition(1, 2, 1, 1),
      "7": getPosition(2, 2, 2, 1),
    },
    // When item 4 is hovered
    "4": {
      "1": getPosition(0, 0, 1, 2),
      "2": getPosition(1, 1, 1, 1),
      "3": getPosition(1, 0, 1, 1),
      "4": getPosition(2, 0, 2, 2),
      "5": getPosition(0, 2, 1, 1),
      "6": getPosition(1, 2, 2, 1),
      "7": getPosition(3, 2, 1, 1),
    },
    // When item 5 is hovered
    "5": {
      "1": getPosition(0, 0, 1, 1),
      "2": getPosition(1, 0, 1, 1),
      "3": getPosition(2, 0, 2, 1),
      "4": getPosition(3, 1, 1, 1),
      "5": getPosition(0, 1, 2, 2),
      "6": getPosition(2, 1, 1, 1),
      "7": getPosition(2, 2, 2, 1),
    },
    // When item 6 is hovered
    "6": {
      "1": getPosition(0, 0, 1, 1),
      "2": getPosition(1, 0, 2, 1),
      "3": getPosition(3, 0, 1, 1),
      "4": getPosition(3, 1, 1, 1),
      "5": getPosition(0, 1, 1, 2),
      "6": getPosition(1, 1, 2, 2),
      "7": getPosition(3, 2, 1, 1),
    },
    // When item 7 is hovered
    "7": {
      "1": getPosition(0, 0, 1, 1),
      "2": getPosition(1, 0, 1, 1),
      "3": getPosition(2, 0, 1, 1),
      "4": getPosition(3, 0, 1, 1),
      "5": getPosition(0, 1, 1, 2),
      "6": getPosition(1, 1, 1, 2),
      "7": getPosition(2, 1, 2, 2),
    },
  };

  // Get current layout based on hovered item
  const currentLayout = useMemo(() => {
    return layoutConfigurations[hoveredItem || "default"];
  }, [hoveredItem]);

  const handleMouseEnter = (itemId: string) => {
    setHoveredItem(itemId);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    itemId: string
  ) => {
    if (hoveredItem === itemId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Customer Showcase</p>
            <h2 className="text-2xl font-medium tracking-tight text-foreground">
              Our favorite goodies ordered by our favorite people
            </h2>
          </div>

          <div className="mx-auto" style={{ width: "1024px", height: "550px" }}>
            <div
              className="relative"
              style={{
                width: "1024px",
                height: "550px",
              }}
            >
              {items.map((item) => {
                const position = currentLayout[item.id];
                return (
                  <div
                    key={item.id}
                    className="absolute overflow-hidden rounded-2xl group hover:z-10 shadow hover:shadow-xl hover:shadow-gray-400 transition-all duration-700 ease-in-out"
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      width: `${position.width}px`,
                      height: `${position.height}px`,
                    }}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={(e) => handleMouseMove(e, item.id)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out"
                      style={{
                        transform:
                          hoveredItem === item.id
                            ? `scale(2.5) translate(${
                                (50 - mousePosition.x) * 0.5
                              }%, ${(50 - mousePosition.y) * 0.5}%)`
                            : "scale(1.2)",
                        transformOrigin: "center center",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
