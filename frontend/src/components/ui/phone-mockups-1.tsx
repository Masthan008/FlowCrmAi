import React from "react";
import type { ImageItem } from "./phone-mockups-1-utils/phone-carousel";
import { PhoneCarousel } from "./phone-mockups-1-utils/phone-carousel";

const flowCrmMobileImages: ImageItem[] = [
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    alt: "FlowCRM Mobile Kanban Sales Pipeline",
    title: "Kanban Pipeline on Mobile",
    subtitle: "Drag-and-drop opportunity movement with instant stage probability updates on iOS & Android.",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    alt: "Grounded AI Opportunity Intelligence",
    title: "Grounded Win Rate Engine",
    subtitle: "Calculated strictly from real deal age, touchpoints, and meeting velocity.",
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    alt: "Automated Lead SLA Routing",
    title: "Instant Lead SLA Routing",
    subtitle: "Smart territory auto-assignment with instant push notifications for critical leads.",
  },
  {
    src: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    alt: "Omnichannel Customer Support Desk",
    title: "360° Support Desk & Live Chat",
    subtitle: "Resolve SLA critical tickets with CSAT ratings & Knowledge Base search on the go.",
  },
];

export default function PhoneMockupBasic() {
  return <PhoneCarousel images={flowCrmMobileImages} />;
}
