# Image Examples for Social Content

## Quick Start

To add images to your content in `app/data/socialContent.ts`:

### 1. Place Your Images

Put images in the `public/images/` folder:

```
public/
  images/
    governance/
      nspc-structure.png
      council-meeting.jpg
    assistance/
      cash-transfer.jpg
    security/
      pension-system.png
```

### 2. Reference in Content

```typescript
{
  id: "your-section",
  title: "Your Title",
  content: "Your text content...",
  image: {
    src: "/images/governance/nspc-structure.png",
    alt: "NSPC Structure",
    caption: "Optional caption here"
  }
}
```

## Copy-Paste Examples

### Example 1: Image on Top

```typescript
{
  id: "governance-structure",
  title: "Governance Structure",
  content: "The National Social Protection Council coordinates policy across ministries.",
  image: {
    src: "/images/governance/nspc-structure.png",
    alt: "NSPC Organizational Chart",
    caption: "Figure 1: National Social Protection Council Structure",
    position: "top"
  }
}
```

### Example 2: Image on Left (Text Wraps Right)

```typescript
{
  id: "council-overview",
  title: "The NSPC Council",
  content: [
    "The council brings together representatives from key ministries.",
    "Regular meetings ensure coordination across all programs."
  ],
  image: {
    src: "/images/governance/council-meeting.jpg",
    alt: "NSPC Council Meeting",
    caption: "Council members in coordination meeting",
    position: "left"
  }
}
```

### Example 3: Image on Right (Text Wraps Left)

```typescript
{
  id: "implementation",
  title: "Program Implementation",
  content: "Social assistance programs are delivered through local offices nationwide.",
  image: {
    src: "/images/assistance/program-office.jpg",
    alt: "Local Program Office",
    position: "right"
  }
}
```

### Example 4: Image Gallery (Multiple Images)

```typescript
{
  id: "assistance-programs",
  title: "Social Assistance Programs",
  content: "Multiple programs support vulnerable populations across Cambodia.",
  images: [
    {
      src: "/images/assistance/cash-transfer.jpg",
      alt: "Cash Transfer Program",
      caption: "Direct cash transfers to families"
    },
    {
      src: "/images/assistance/school-feeding.jpg",
      alt: "School Feeding",
      caption: "Nutritious meals for students"
    },
    {
      src: "/images/assistance/elderly-care.jpg",
      alt: "Elderly Support",
      caption: "Services for elderly citizens"
    }
  ]
}
```

### Example 5: Full-Width Image

```typescript
{
  id: "coverage-map",
  title: "National Coverage",
  content: "Programs now cover all 25 provinces, reaching 2 million beneficiaries.",
  image: {
    src: "/images/maps/cambodia-coverage.png",
    alt: "Cambodia Coverage Map",
    caption: "Geographic distribution of programs (2026)",
    position: "full"
  }
}
```

### Example 6: Section with Subsections (Each with Images)

```typescript
{
  id: "future-strategies",
  title: "Future Strategies",
  content: "The government has outlined key strategic priorities.",
  image: {
    src: "/images/roadmap.png",
    alt: "Strategic Roadmap",
    position: "top"
  },
  subsections: [
    {
      id: "emergency",
      title: "1. Emergency Response",
      content: "Strengthen capacity to respond to crises.",
      image: {
        src: "/images/emergency-team.jpg",
        alt: "Emergency Response Training",
        position: "right"
      }
    },
    {
      id: "training",
      title: "2. Vocational Training",
      content: "Expand skills development programs.",
      images: [
        { src: "/images/training1.jpg", alt: "Skills Training" },
        { src: "/images/training2.jpg", alt: "Job Placement" }
      ]
    }
  ]
}
```

## How to Use

1. **Copy** one of the examples above
2. **Paste** into the appropriate place in `app/data/socialContent.ts`
3. **Update** the image paths to match your files
4. **Save** - changes appear immediately!

## Image Positions Explained

| Position | Effect                              |
| -------- | ----------------------------------- |
| `top`    | Image above text (default)          |
| `bottom` | Image below text                    |
| `left`   | Image left, text wraps right        |
| `right`  | Image right, text wraps left        |
| `full`   | Full-width (extends beyond padding) |

## Tips

✅ **Do:**

- Use descriptive `alt` text for accessibility
- Add `caption` for charts/diagrams
- Optimize image sizes (compress before uploading)
- Use consistent naming (lowercase, hyphens)

❌ **Don't:**

- Forget the leading `/` in paths (`/images/...`)
- Use spaces in filenames
- Upload huge uncompressed files
- Skip the `alt` attribute

## Need Help?

Check the full guide: `SOCIAL_CONTENT_GUIDE.md`
