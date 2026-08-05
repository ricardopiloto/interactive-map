# Data Model: Refine Segment Stroke Weight

**Feature**: `048-refine-segment-stroke` | **Date**: 2026-08-05

## Overview

No persisted entities change. Presentation tokens only.

## Presentation tokens

| Token | Meaning | Target |
|-------|---------|--------|
| Segment stroke (normal) | Saved + draft visible polyline width | ~**1.0** (was 1.5) |
| Segment stroke (hover) | Idle hover emphasis width | ~**2.3** (was 3.5) |
| Segment hit stroke | Invisible interaction fatness | **12** (unchanged) |

## Validation rules

| Rule | Constraint |
|------|------------|
| Factor | ~⅔ of pre-048 digitizer widths |
| Types | Colors/dashes unchanged in intent |
| Persistence | Segment geometry / DB unchanged |

## State

No lifecycle — static CSS until next visual tune.
