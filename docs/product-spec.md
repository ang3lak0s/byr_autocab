# BYR AutoCab — Product Specification

**Version:** 0.1.0
**Status:** Initial MVP specification
**Product:** BYR AutoCab
**Parent brand:** BYR — Build Your Rig

---

## 1. Product Overview

BYR AutoCab is a web application designed to help guitarists, bassists, and DIY builders plan and estimate the construction of custom speaker cabinets.

The application should allow users to define a cabinet's physical characteristics, speaker configuration, construction method, materials, and components.

BYR AutoCab then generates:

* Cabinet geometry
* Internal dimensions
* Approximate internal volume
* Speaker clearance validation
* Panel cut list
* Material requirements
* Estimated material/component costs
* Required tools
* Basic build information
* Design warnings and validation messages

The application is intended to be useful for both beginners with basic hand/power tools and experienced DIY builders with more advanced woodworking equipment.

---

## 2. Product Philosophy

The core philosophy of BYR AutoCab is:

> **Don't force the builder to adapt to the software. Adapt the build plan to the builder.**

The application should prioritize practical, understandable, and transparent calculations over unnecessary complexity.

BYR AutoCab is a planning and estimation tool.

It is NOT intended to initially be:

* A professional CAD replacement
* A full acoustic simulation package
* A speaker-design laboratory
* A structural engineering certification tool
* An AI-first application

Calculations should be deterministic and explainable.

AI may be introduced later as an assistance layer, but AI must not replace deterministic engineering calculations where exact calculations are possible.

---

# 3. Target Users

## Primary Users

### DIY Guitarists

Guitarists who want to build their own:

* 1x12 cabinets
* 2x12 cabinets
* 4x12 cabinets
* Bass cabinets
* Custom speaker enclosures

They may have only basic tools such as:

* Hand saw
* Circular saw
* Drill/driver
* Screwdriver
* Hammer
* Measuring tape
* Square
* Clamps

### Experienced DIY Builders

Users with access to:

* Table saws
* Routers
* Jigs
* Advanced clamps
* Workshop machinery

These users may want more advanced construction methods and greater customization.

### Guitar/Bass Enthusiasts

Users who may not build cabinets frequently but want to understand:

* What materials they need
* How much the project will cost
* What dimensions are practical
* What tools are required

---

# 4. MVP Goals

The MVP should answer one fundamental question:

> **Can a user describe a cabinet they want to build and receive a useful, practical, and understandable build plan?**

The MVP should support:

1. Cabinet configuration
2. Speaker configuration
3. Cabinet orientation/form factor
4. External dimensions
5. Material thickness
6. Basic construction methods
7. Open/closed back configuration
8. Material estimation
9. Cost estimation
10. Cut-list generation
11. Basic validation
12. Build-tool requirements
13. Build summary

---

# 5. MVP Non-Goals

The following features are intentionally excluded from the first MVP:

* User accounts
* Social profiles
* Community features
* Marketplace
* AI cabinet generation
* AI chat assistant
* 3D CAD
* 3D rendering
* Acoustic simulation
* Thiele-Small speaker enclosure calculations
* Detailed port/vent simulation
* Complex angled cabinet geometry
* Finger joints
* Dovetail joints
* Custom arbitrary speaker positioning
* Automatic retailer pricing
* Local hardware-store integration
* Mobile native applications

These may be considered in future versions.

---

# 6. Cabinet Configuration

## 6.1 External Dimensions

Users specify:

* Width
* Height
* Depth

All dimensions should initially use millimetres.

The UI should clearly label these as:

> External cabinet dimensions

The application must not silently modify user-provided dimensions.

If the dimensions produce an impractical design, BYR AutoCab should warn the user rather than automatically changing the design.

---

# 7. Speaker Configuration

## 7.1 Speaker Count

MVP-supported speaker counts:

* 1
* 2
* 4

Future versions may support arbitrary speaker counts.

## 7.2 Speaker Diameter

Initial presets:

* 8"
* 10"
* 12"
* 15"

Also provide:

* Custom

## 7.3 Speaker Cutout Diameter

For MVP calculations, users should be able to specify the actual speaker cutout diameter.

This is preferable to assuming every speaker of a given nominal diameter has the same cutout.

Future versions may provide a speaker database containing manufacturer/model-specific dimensions.

---

# 8. Speaker Layout

Speaker count and physical arrangement are separate concepts.

Supported MVP layouts:

### Single

```text
[ SPEAKER ]
```

### Horizontal 2x

```text
[ SPEAKER ][ SPEAKER ]
```

### Vertical 2x

```text
[ SPEAKER ]
[ SPEAKER ]
```

### 2x2 Grid

```text
[ SPEAKER ][ SPEAKER ]
[ SPEAKER ][ SPEAKER ]
```

Future versions may support arbitrary speaker positions.

---

# 9. Cabinet Form Factor

The cabinet should have a form-factor classification independent of speaker configuration.

Supported values:

* Horizontal
* Square / near-square
* Vertical
* Custom

Examples:

### Horizontal

Wide cabinet with width greater than height.

### Square

Approximately equal width and height.

### Vertical

Height greater than width.

The application should not automatically force dimensions based on the selected form factor.

The form factor is primarily descriptive and may influence presets and warnings.

---

# 10. Construction Methods

Construction method is a first-class design choice.

The user should not be required to own advanced woodworking equipment.

## 10.1 Basic Screw/Nail

Recommended for users with basic tools.

Construction:

* Butt joints
* Screws and/or nails
* Wood glue optional

Required tools may include:

* Saw
* Drill/driver
* Screwdriver/driver bit
* Hammer when nails are selected
* Measuring tape
* Square

## 10.2 Glue + Screw/Nail

Construction:

* Butt joints
* Wood glue
* Screws or nails
* Clamps recommended

This should be considered a reinforced butt-joint construction method.

## 10.3 Rabbet + Glue

Advanced construction method.

Construction:

* Rabbet joints
* Wood glue
* Clamps

Required tools may include:

* Router or table saw
* Appropriate cutting equipment
* Clamps
* Measuring tools

This method should be implemented after the basic butt-joint calculation engine is stable.

---

# 11. Back Configuration

MVP options:

* Closed back
* Half open
* Mostly open

The application should represent the rear configuration explicitly.

Future versions may allow custom rear openings.

---

# 12. Material Configuration

The user should be able to specify:

### Wood

* Material name
* Thickness
* Sheet/board width
* Sheet/board length
* Price per sheet/board

Examples:

* Birch plywood
* Pine
* MDF
* Custom material

The application should not hard-code material prices.

Prices are user-provided estimates.

---

# 13. Cut List

The calculation engine must generate a structured cut list.

Each item should contain:

* Part name
* Quantity
* Width
* Height/depth
* Material thickness
* Notes

Example:

| Part       | Quantity | Width | Height/Depth |
| ---------- | -------: | ----: | -----------: |
| Left side  |        1 |   ... |          ... |
| Right side |        1 |   ... |          ... |
| Top        |        1 |   ... |          ... |
| Bottom     |        1 |   ... |          ... |
| Baffle     |        1 |   ... |          ... |
| Back       |        1 |   ... |          ... |

The cut-list generator must be independent from the user interface.

Different construction methods may eventually use different calculation engines while producing the same cut-list data structure.

---

# 14. Geometry Calculations

For the initial basic rectangular construction profile:

Let:

* `W` = external width
* `H` = external height
* `D` = external depth
* `T` = material thickness

For the baseline internal-baffle construction:

```text
Internal Width  = W - 2T
Internal Height = H - 2T
Internal Depth  = D - 2T
```

Approximate geometric internal volume:

```text
Volume (litres) =
Internal Width × Internal Height × Internal Depth / 1,000,000
```

This is only a geometric estimate.

The application must clearly state that the volume does not account for:

* Speaker displacement
* Bracing
* Internal hardware
* Ports
* Other internal components

---

# 15. Speaker Clearance Validation

The application should check whether the selected speakers can reasonably fit on the baffle.

At minimum, validation should consider:

* Speaker cutout diameter
* Number of speakers
* Speaker layout
* Baffle width
* Baffle height
* Minimum edge clearance
* Minimum spacing between speaker cutouts

The application should warn users when a configuration appears physically impossible or unusually constrained.

Example:

> ⚠ Two 12" speakers may not fit horizontally within the selected baffle dimensions.

The application should warn rather than silently resize the cabinet.

Exact speaker-specific clearances may be introduced when a speaker database is implemented.

---

# 16. Material Calculation

For each panel:

```text
Panel Area = Width × Height
```

Total panel area:

```text
Total Area =
Σ(Panel Area × Quantity)
```

The application should support a configurable material waste allowance.

Initial default:

```text
Waste Allowance = 10%
```

Estimated required material:

```text
Required Material =
Total Panel Area × (1 + Waste Allowance)
```

Future versions should implement actual sheet-cut optimization rather than relying solely on area.

---

# 17. Cost Calculation

Costs should be modular.

Initial categories:

* Wood
* Speakers
* Grill cloth
* Tolex/covering
* Hardware
* Wiring/electronics
* Miscellaneous

Total estimated cost:

```text
Total Cost =
Wood
+ Speakers
+ Grill Cloth
+ Covering
+ Hardware
+ Wiring/Electronics
+ Miscellaneous
```

Users should be able to add custom cost items.

The application should clearly distinguish:

> Estimated cost

from:

> Actual cost

Actual-cost tracking may be implemented in a future version.

---

# 18. Build Difficulty

The application should provide a simple difficulty classification based on the selected construction method and design complexity.

Initial levels:

### 🟢 Beginner

Basic butt joints with screws/nails.

### 🟡 Intermediate

Glue + mechanical fasteners and more involved construction.

### 🔴 Advanced

Rabbet joints or other advanced construction techniques.

Difficulty should be explainable rather than presented as an unexplained score.

---

# 19. Required Tools

The generated build summary should identify tools required or recommended based on the construction method.

Examples:

### Basic construction

* Measuring tape
* Square
* Saw
* Drill/driver
* Screwdriver/driver bits
* Hammer if nails are used
* Clamps recommended

### Rabbet construction

* Measuring tools
* Router or table saw
* Appropriate cutting accessories
* Clamps
* Drill/driver

The application should distinguish between:

* Required
* Recommended
* Optional

---

# 20. Validation Philosophy

BYR AutoCab must never silently modify user input.

If a design appears problematic, show an explicit warning.

Examples:

* Speaker does not fit
* Insufficient speaker clearance
* Cabinet dimensions are unusually small
* Cabinet dimensions are unusually large
* Material thickness produces an unexpected internal volume
* Selected material dimensions are insufficient
* Required construction equipment is not available for the selected build method

Warnings should explain the reason and, where possible, suggest what the user could change.

---

# 21. User Experience

The application should prioritize clarity over information density.

A beginner should be able to understand the interface without already knowing woodworking terminology.

Technical terms may be accompanied by short explanations or tooltips.

Advanced users should still have access to precise dimensions and configuration options.

The application should use progressive disclosure:

1. Basic configuration
2. Dimensions
3. Construction
4. Materials
5. Components
6. Results

Do not overwhelm the user with every possible setting on the first screen.

---

# 22. Homepage

The initial homepage should communicate the purpose immediately.

## Brand

**BYR AutoCab**

**Build Your Rig. Design Your Cabinet.**

## Hero message

> Design the cab. Calculate the build. Build the rig.

Supporting text:

> Plan custom guitar and bass cabinets with practical dimensions, cut lists, material requirements, and cost estimates.

Primary call-to-action:

> Start a Cabinet

Secondary action:

> Explore Example Builds

The visual design should feel:

* Technical
* Modern
* Clean
* Guitar-oriented
* Workshop-inspired

It should avoid looking like a generic corporate SaaS dashboard or an online guitar store.

---

# 23. Homepage Initial Sections

The first version of the homepage should contain:

1. Navigation/header
2. Hero section
3. Start a Cabinet CTA
4. Example cabinet configurations
5. "Built for real-world DIY" section
6. Construction-method overview
7. Short explanation of how BYR AutoCab works
8. Footer

Avoid adding unnecessary marketing sections until the product has validated demand.

---

# 24. AI Philosophy

AI is not required for the MVP.

Future AI functionality may include:

* Natural-language cabinet configuration
* AI-assisted design suggestions
* Material recommendations
* Build-plan explanations
* Design troubleshooting
* Natural-language project editing

Example:

> "I want a compact closed-back 1x12 for high-gain guitar that I can build with basic tools."

The AI may convert this into a proposed configuration.

However:

> **AI must suggest; deterministic application logic must calculate.**

AI-generated dimensions or calculations must not be treated as authoritative without validation through the calculation engine.

---

# 25. Technology Direction

Initial frontend:

* Angular
* TypeScript
* Modern responsive web standards

Initial application architecture should allow the calculation/domain logic to remain independent of UI components.

The initial prototype may operate without a backend.

Potential future backend:

* Java
* Spring Boot
* PostgreSQL

Potential future services:

* Firebase
* Gemini API
* User authentication
* Cloud storage

These are not required for the initial MVP.

---

# 26. Design and Engineering Principles

The codebase should prioritize:

* Strong typing
* Separation of domain logic and presentation
* Testable calculation functions
* Reusable components
* Accessible UI
* Responsive design
* Clear error handling
* Deterministic calculations
* No unnecessary dependencies
* No premature abstraction

Calculation logic should be unit-tested with known cabinet examples.

The UI should never contain complex cabinet geometry calculations directly.

---

# 27. Future Product Direction

Potential future features include:

* Pedalboard planner
* Complete rig planner
* Speaker database
* Hardware/material database
* Sheet-cut optimization
* 2D cabinet visualization
* 3D cabinet visualization
* Custom speaker positioning
* Advanced joinery
* Angled/slanted cabinets
* Ported cabinet calculations
* Speaker/Thiele-Small calculations
* Project saving
* User accounts
* PDF build plans
* AI design assistant
* Local material/tool retailer integration
* Community project sharing
* Project marketplace

These features should not be implemented until the core cabinet-planning workflow is stable.

---

# 28. MVP Success Criteria

The MVP is successful if a guitarist can:

1. Open BYR AutoCab.
2. Start a new cabinet.
3. Select speaker configuration and layout.
4. Enter external dimensions.
5. Select a realistic construction method.
6. Enter material/component prices.
7. Receive a clear validation result.
8. Receive a usable cut list.
9. Receive a material list.
10. Receive a reasonable cost estimate.
11. Understand what tools are required.
12. Understand the assumptions behind the calculations.

The user should be able to take the resulting plan into their workshop and understand what BYR AutoCab is recommending.

---

# 29. Guiding Principle

> **BYR AutoCab exists to turn "I want to build this" into "I know what I need to build it."**
