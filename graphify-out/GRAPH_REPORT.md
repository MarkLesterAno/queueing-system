# Graph Report - .  (2026-05-24)

## Corpus Check
- Corpus is ~27,904 words - fits in a single context window. You may not need a graph.

## Summary
- 685 nodes · 1201 edges · 48 communities (36 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.84)
- Token cost: 2,435 input · 2,867 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Queue Management|Queue Management]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_UI Layout Components|UI Layout Components]]
- [[_COMMUNITY_UI Form Components|UI Form Components]]
- [[_COMMUNITY_Toast Notification System|Toast Notification System]]
- [[_COMMUNITY_UI Avatar & Card|UI Avatar & Card]]
- [[_COMMUNITY_Brand & Design System|Brand & Design System]]
- [[_COMMUNITY_App Layout & Fonts|App Layout & Fonts]]
- [[_COMMUNITY_Command & Dialog|Command & Dialog]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Component Aliases|Component Aliases]]
- [[_COMMUNITY_Menu Bar|Menu Bar]]
- [[_COMMUNITY_Dropdown Menu|Dropdown Menu]]
- [[_COMMUNITY_Context Menu|Context Menu]]
- [[_COMMUNITY_Button & Calendar|Button & Calendar]]
- [[_COMMUNITY_Form Controls|Form Controls]]
- [[_COMMUNITY_Carousel|Carousel]]
- [[_COMMUNITY_Alert Dialog|Alert Dialog]]
- [[_COMMUNITY_Chart Components|Chart Components]]
- [[_COMMUNITY_Drawer|Drawer]]
- [[_COMMUNITY_Input Group & Textarea|Input Group & Textarea]]
- [[_COMMUNITY_Select|Select]]
- [[_COMMUNITY_Navigation Menu|Navigation Menu]]
- [[_COMMUNITY_Package Name & Scripts|Package Name & Scripts]]
- [[_COMMUNITY_CSS Build Tools|CSS Build Tools]]
- [[_COMMUNITY_Empty State|Empty State]]
- [[_COMMUNITY_Breadcrumb|Breadcrumb]]
- [[_COMMUNITY_Toggle Group|Toggle Group]]
- [[_COMMUNITY_Alert|Alert]]
- [[_COMMUNITY_Popover|Popover]]
- [[_COMMUNITY_Input OTP|Input OTP]]
- [[_COMMUNITY_Accordion|Accordion]]
- [[_COMMUNITY_Resizable|Resizable]]
- [[_COMMUNITY_Recall TTS|Recall TTS]]
- [[_COMMUNITY_Text-to-Speech Hook|Text-to-Speech Hook]]
- [[_COMMUNITY_Office Form Interfaces|Office Form Interfaces]]
- [[_COMMUNITY_Badge|Badge]]
- [[_COMMUNITY_Office Stats Interface|Office Stats Interface]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Generic Placeholders|Generic Placeholders]]
- [[_COMMUNITY_QueueFlow Brand Logos|QueueFlow Brand Logos]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_User Avatar Placeholder|User Avatar Placeholder]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 272 edges
2. `QueueFlow README` - 24 edges
3. `officeKeys()` - 17 edges
4. `compilerOptions` - 16 edges
5. `getOfficeTickets()` - 13 edges
6. `getOfficeServing()` - 12 edges
7. `getStoredOffices()` - 10 edges
8. `buttonVariants` - 9 edges
9. `Framer Motion` - 9 edges
10. `Button()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  lib/utils.ts → package.json
- `App Icon SVG` --conceptually_related_to--> `QueueFlow System`  [INFERRED]
  public/icon.svg → README.md
- `DrawerOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/drawer.tsx → lib/utils.ts
- `DrawerContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/drawer.tsx → lib/utils.ts
- `DrawerHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/drawer.tsx → lib/utils.ts

## Hyperedges (group relationships)
- **Real-time Infrastructure** — nextjs_16, upstash_redis, sse_mechanism, swr_polling [INFERRED 0.85]
- **Design System** — swiss_design_aesthetic, dark_mode_design, figtree_font, dm_mono_font, design_system_tokens [INFERRED 0.85]
- **Queue Management Workflow** — central_kiosk, display_board, operator_panel, supervisor_dashboard, ticket_transfer, ticket_lifecycle [EXTRACTED 1.00]

## Communities (48 total, 12 thin omitted)

### Community 0 - "Queue Management"
Cohesion: 0.00
Nodes (52): GET(), OfficeAdminDashboard(), STATUS_STYLES, CenralKiosk(), DEFAULT_COLORS, OfficeRow(), OfficeStat, StatCard() (+44 more)

### Community 1 - "Package Dependencies"
Cohesion: 0.00
Nodes (52): dependencies, autoprefixer, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion (+44 more)

### Community 2 - "UI Layout Components"
Cohesion: 0.00
Nodes (41): useIsMobile(), Input(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+33 more)

### Community 3 - "UI Form Components"
Cohesion: 0.00
Nodes (39): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Field(), FieldContent(), FieldDescription(), FieldError() (+31 more)

### Community 4 - "Toast Notification System"
Cohesion: 0.00
Nodes (36): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+28 more)

### Community 5 - "UI Avatar & Card"
Cohesion: 0.00
Nodes (29): cn(), Avatar(), AvatarFallback(), AvatarImage(), Card(), CardAction(), CardContent(), CardDescription() (+21 more)

### Community 6 - "Brand & Design System"
Cohesion: 0.00
Nodes (29): Apple Touch Icon, Central Kiosk, CSV Export, Dark Mode Design, Design System Color Tokens, Per-Office Display Board, DM Mono Font, Figtree Font (+21 more)

### Community 7 - "App Layout & Fonts"
Cohesion: 0.00
Nodes (16): dmMono, figtree, metadata, viewport, ThemeContext, ThemeContextType, ThemeProvider(), useTheme() (+8 more)

### Community 8 - "Command & Dialog"
Cohesion: 0.00
Nodes (15): Command(), CommandDialog(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+7 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.00
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Component Aliases"
Cohesion: 0.00
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 11 - "Menu Bar"
Cohesion: 0.00
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 12 - "Dropdown Menu"
Cohesion: 0.00
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 13 - "Context Menu"
Cohesion: 0.00
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 14 - "Button & Calendar"
Cohesion: 0.00
Nodes (11): Button(), buttonVariants, Calendar(), CalendarDayButton(), Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink() (+3 more)

### Community 15 - "Form Controls"
Cohesion: 0.00
Nodes (6): Checkbox(), HoverCardContent(), Progress(), Slider(), Spinner(), Switch()

### Community 16 - "Carousel"
Cohesion: 0.00
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 17 - "Alert Dialog"
Cohesion: 0.00
Nodes (8): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay(), AlertDialogTitle()

### Community 18 - "Chart Components"
Cohesion: 0.00
Nodes (8): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), THEMES, useChart()

### Community 19 - "Drawer"
Cohesion: 0.00
Nodes (6): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 20 - "Input Group & Textarea"
Cohesion: 0.00
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 21 - "Select"
Cohesion: 0.00
Nodes (7): SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 22 - "Navigation Menu"
Cohesion: 0.00
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 23 - "Package Name & Scripts"
Cohesion: 0.00
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 24 - "CSS Build Tools"
Cohesion: 0.00
Nodes (9): devDependencies, postcss, tailwindcss, @tailwindcss/postcss, tw-animate-css, @types/node, @types/react, @types/react-dom (+1 more)

### Community 25 - "Empty State"
Cohesion: 0.00
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 26 - "Breadcrumb"
Cohesion: 0.00
Nodes (6): BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 27 - "Toggle Group"
Cohesion: 0.00
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 28 - "Alert"
Cohesion: 0.00
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 30 - "Input OTP"
Cohesion: 0.00
Nodes (3): InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 31 - "Accordion"
Cohesion: 0.00
Nodes (3): AccordionContent(), AccordionItem(), AccordionTrigger()

## Knowledge Gaps
- **162 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+157 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Avatar & Card` to `Package Dependencies`, `UI Layout Components`, `UI Form Components`, `Toast Notification System`, `Command & Dialog`, `Menu Bar`, `Dropdown Menu`, `Context Menu`, `Button & Calendar`, `Form Controls`, `Carousel`, `Alert Dialog`, `Chart Components`, `Drawer`, `Input Group & Textarea`, `Select`, `Navigation Menu`, `Empty State`, `Breadcrumb`, `Toggle Group`, `Alert`, `Popover`, `Input OTP`, `Accordion`, `Resizable`, `Badge`?**
  _High betweenness centrality (0.667) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Package Dependencies` to `Brand & Design System`, `Package Name & Scripts`?**
  _High betweenness centrality (0.414) - this node is a cross-community bridge._
- **Why does `clsx` connect `Package Dependencies` to `UI Avatar & Card`?**
  _High betweenness centrality (0.365) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Queue Management` be split into smaller, more focused modules?**
  _Cohesion score 0.056134723336006415 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.038461538461538464 - nodes in this community are weakly interconnected._
- **Should `UI Layout Components` be split into smaller, more focused modules?**
  _Cohesion score 0.053877551020408164 - nodes in this community are weakly interconnected._