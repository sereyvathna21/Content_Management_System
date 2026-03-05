# Social Content Management Guide

## Overview

The social resources content uses a data-driven approach, making it easy to update content including text and images without touching component code.

## File Structure

```
app/
├── data/
│   └── socialContent.ts          # ✅ Edit this to update content
├── components/
│   └── SocialContentRenderer.tsx # Renders content (no need to edit)
└── Landing-page/Resources/Social/
    ├── page.tsx                  # Main page with tabs
    ├── Governance/page.tsx       # Individual Governance page
    ├── SocialAssistance/page.tsx # Individual Social Assistance page
    └── SocialSecurity/page.tsx   # Individual Social Security page
```

## How to Update Content

### Editing Text Content

To update any text, simply edit **`app/data/socialContent.ts`**:

```typescript
export const socialContent = {
  governance: {
    sections: [
      {
        id: "overview",
        title: "General Overview",
        content: "Your updated text here...", // ✅ Edit this
      },
    ],
  },
};
```

### Adding Images

#### Basic Image Properties

```typescript
image: {
  src: "/images/your-image.jpg",    // Path to image (required)
  alt: "Description of image",       // Alt text for accessibility (required)
  caption: "Figure 1: Image caption", // Optional caption
  position: "top"                    // Optional: "top", "bottom", "left", "right", "full"
}
```

#### Image Position Options

- **`top`** (default): Image appears above the text
- **`bottom`**: Image appears below the text
- **`left`**: Image on left, text wraps on right (2-column layout)
- **`right`**: Image on right, text wraps on left (2-column layout)
- **`full`**: Full-width image (extends beyond content padding)

## Examples

### 1. Single Paragraph

```typescript
{
  id: "intro",
  title: "Introduction",
  content: "This is a single paragraph of text."
}
```

### 2. Multiple Paragraphs

```typescript
{
  id: "overview",
  title: "Overview",
  content: [
    "First paragraph of content.",
    "Second paragraph of content.",
    "Third paragraph of content."
  ]
}
```

### 3. Section with Image on Top

```typescript
{
  id: "governance-structure",
  title: "Governance Structure",
  content: "The NSPC organizational structure includes multiple stakeholders...",
  image: {
    src: "/images/governance-structure.png",
    alt: "NSPC Organizational Chart",
    caption: "Figure 1: National Social Protection Council Structure",
    position: "top"
  }
}
```

### 4. Section with Image on Left

```typescript
{
  id: "policy-maker",
  title: "Policy-Maker",
  content: [
    "The National Social Protection Council serves as the central coordinating body.",
    "Key responsibilities include oversight and policy development."
  ],
  image: {
    src: "/images/nspc-council.jpg",
    alt: "NSPC Council in session",
    caption: "NSPC Council meeting",
    position: "left"
  }
}
```

### 5. Multiple Images Gallery

```typescript
{
  id: "programs",
  title: "Social Assistance Programs",
  content: "Various programs have been implemented across Cambodia...",
  images: [
    {
      src: "/images/cash-transfer.jpg",
      alt: "Cash Transfer Program",
      caption: "Cash transfer distribution to beneficiaries"
    },
    {
      src: "/images/school-feeding.jpg",
      alt: "School Feeding Program",
      caption: "Nutritious meals provided to students"
    },
    {
      src: "/images/elderly-support.jpg",
      alt: "Elderly Support Program",
      caption: "Support services for elderly citizens"
    }
  ]
}
```

### 6. Full Width Image

```typescript
{
  id: "coverage-map",
  title: "National Coverage",
  content: "The program has expanded to all 25 provinces...",
  image: {
    src: "/images/cambodia-coverage-map.png",
    alt: "Cambodia Social Protection Coverage Map",
    caption: "Geographic distribution of social protection programs",
    position: "full"
  }
}
```

### 7. With Nested Subsections

```typescript
{
  id: "strategies",
  title: "Future Strategies",
  content: "The government has outlined several strategic priorities...",
  image: {
    src: "/images/strategic-roadmap.png",
    alt: "Strategic Roadmap 2026-2030",
    position: "top"
  },
  subsections: [
    {
      id: "strategy1",
      title: "1. Emergency Response",
      content: "Strengthen institutional capacity...",
      image: {
        src: "/images/emergency-response.jpg",
        alt: "Emergency Response Team",
        position: "right"
      }
    },
    {
      id: "strategy2",
      title: "2. Human Capital",
      content: "Invest in education and training..."
    }
  ]
}
```

## Image Best Practices

### File Organization

```
public/
├── images/
│   ├── governance/
│   │   ├── nspc-structure.png
│   │   └── council-meeting.jpg
│   ├── assistance/
│   │   ├── cash-transfer.jpg
│   │   └── school-feeding.jpg
│   └── security/
│       ├── pension-system.png
│       └── healthcare-coverage.jpg
```

### Recommended Sizes

- **Full width images**: 1200-1600px wide
- **Side-by-side images**: 800px wide
- **Gallery images**: 600px wide
- **File format**: Use WebP or JPG for photos, PNG for diagrams/charts
- **Optimize**: Compress images to reduce file size

### Accessibility

Always include:

- **`alt`**: Descriptive text for screen readers
- **`caption`**: Context for complex images (charts, diagrams)

## Complete Example

```typescript
{
  id: "pension-reform",
  title: "Pension System Reform",
  content: [
    "The Royal Government is undertaking comprehensive pension reform.",
    "The new system aims to provide universal coverage for all citizens."
  ],
  image: {
    src: "/images/security/pension-structure.png",
    alt: "New Integrated Pension System Structure",
    caption: "Figure 2: Proposed pension system architecture",
    position: "top"
  },
  subsections: [
    {
      id: "public-pensions",
      title: "Public Sector Pensions",
      content: "Civil servants will transition to a contributory scheme...",
      image: {
        src: "/images/security/public-pension.jpg",
        alt: "Public Pension Enrollment",
        position: "left"
      }
    },
    {
      id: "private-pensions",
      title: "Private Sector Pensions",
      content: "Workers in the formal private sector contribute to NSSF...",
      images: [
        {
          src: "/images/security/nssf-office.jpg",
          alt: "NSSF Service Center"
        },
        {
          src: "/images/security/enrollment.jpg",
          alt: "Worker Enrollment Process"
        }
      ]
    }
  ]
}
```

## Quick Reference

### Text Only

```typescript
{ id: "x", title: "Title", content: "Text..." }
```

### Text + Top Image

```typescript
{
  id: "x",
  title: "Title",
  content: "Text...",
  image: { src: "/img.jpg", alt: "...", position: "top" }
}
```

### Text + Side Image

```typescript
{
  id: "x",
  title: "Title",
  content: "Text...",
  image: { src: "/img.jpg", alt: "...", position: "left" }
}
```

### Text + Gallery

```typescript
{
  id: "x",
  title: "Title",
  content: "Text...",
  images: [
    { src: "/img1.jpg", alt: "..." },
    { src: "/img2.jpg", alt: "..." }
  ]
}
```

## Tips

1. **Image Paths**: Store images in `/public/images/` folder
2. **Responsive**: Images automatically resize on mobile
3. **Performance**: Next.js Image component optimizes loading
4. **Captions**: Use for charts, diagrams, or complex images
5. **Galleries**: Work best with 2-4 images
6. **Mix & Match**: Each section can have different image layouts

## Need Help?

- Check existing sections in `socialContent.ts` for examples
- Test changes locally - hot reload shows updates immediately
- Images not showing? Verify the path starts with `/` and file exists in `/public/`
