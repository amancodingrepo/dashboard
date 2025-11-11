# Pixel-Perfect QA Checklist

Use this checklist to verify the implementation matches Figma specifications exactly.

---

## 🎯 Layout & Dimensions

### Sidebar (Left Panel)
- [ ] Width is exactly **240px**
- [ ] Background color is **#FBFCFE**
- [ ] Border-right is **1px solid #EEF2F6**
- [ ] Logo area height is exactly **80px**
- [ ] Logo area has **24px left padding**
- [ ] Logo icon is **32px × 32px**
- [ ] "GENERAL" label is **11px uppercase** with tracking
- [ ] Nav items have **18px vertical spacing** between them
- [ ] Nav item text is **14px / 20px**
- [ ] Nav icons are **20px** size
- [ ] Active nav item has **4px left border** in **#6366F1**
- [ ] Active nav item background is **rgba(99,102,241,0.08)**
- [ ] Flowbit AI logo at bottom has border-top

### Topbar (Header)
- [ ] Height is exactly **64px**
- [ ] Background is **#FFFFFF**
- [ ] Border-bottom is **1px solid #EEF2F6**
- [ ] Horizontal padding is **32px**
- [ ] "Dashboard" title is **20px / 28px semibold**
- [ ] Avatar is **36px circle**
- [ ] Avatar has **2px white border**
- [ ] Name text is **14px medium**
- [ ] Role text is **12px muted**

### Main Content Area
- [ ] Starts at **x: 240px** (after sidebar)
- [ ] Starts at **y: 80px** (64px topbar + 16px margin)
- [ ] Has **32px padding** on all sides
- [ ] Background is **#FFFFFF**

---

## 📊 Metric Cards (Row 1)

### Layout
- [ ] 4 cards in a row
- [ ] Each card is **260px wide**
- [ ] Each card is **96px tall**
- [ ] Gap between cards is **24px**
- [ ] Cards use grid layout with `grid-cols-4`

### Card Styling
- [ ] Padding is exactly **20px**
- [ ] Border-radius is exactly **12px**
- [ ] Border is **1px solid rgba(17,24,39,0.04)**
- [ ] Box-shadow is **0 2px 8px rgba(12,20,40,0.04)**
- [ ] Background is **#FFFFFF**

### Typography
- [ ] Title text is **14px / 20px semibold**
- [ ] Title color is **#101828**
- [ ] Metric number is **28px / 32px bold**
- [ ] Metric color is **#0F172A**
- [ ] Delta text is **12px semibold**
- [ ] Positive delta is **#10B981**
- [ ] Negative delta is **#EF4444**
- [ ] "from last month" is **12px regular #6B7280**

### Spacing
- [ ] Title to metric: **8px** (mb-1)
- [ ] Metric to delta: **8px** (mb-1)
- [ ] Period badge has **8px padding**

---

## 📈 Main Charts (Row 2)

### Layout
- [ ] 2 charts side by side
- [ ] Gap between charts is **24px**
- [ ] Margin-bottom to next row is **24px**

### Left Chart (Invoice Volume + Value Trend)
- [ ] Width is exactly **720px**
- [ ] Height is exactly **420px**
- [ ] Card padding is **20px**
- [ ] Border-radius is **12px**
- [ ] Box-shadow is **0 6px 18px rgba(12,20,40,0.06)**
- [ ] Title is **16px / 24px semibold**
- [ ] Subtitle is **12px / 16px #6B7280**
- [ ] Title to subtitle: **8px**
- [ ] Subtitle to chart: **24px**

### Right Chart (Spend by Vendor Top 10)
- [ ] Width is exactly **600px**
- [ ] Height is exactly **420px**
- [ ] Same card styling as left chart
- [ ] Same typography as left chart

---

## 📊 Bottom Charts (Row 3)

### Layout
- [ ] 3 charts in a row
- [ ] Gap between charts is **24px**

### Left Chart (Spend by Category)
- [ ] Width is exactly **360px**
- [ ] Height is exactly **340px**
- [ ] Card padding is **20px**
- [ ] Border-radius is **12px**
- [ ] Box-shadow is **0 6px 18px rgba(12,20,40,0.06)**

### Center Chart (Cash Outflow Forecast)
- [ ] Width is exactly **360px**
- [ ] Height is exactly **340px**
- [ ] Same styling as left chart

### Right Chart (Invoices by Vendor Table)
- [ ] Width is exactly **600px**
- [ ] Height is exactly **340px**
- [ ] Same card styling
- [ ] Table header height: **48px**
- [ ] Table row height: **56px**
- [ ] Column widths: **40% / 30% / 30%**

---

## 🎨 Colors Verification

### Primary Colors
- [ ] Primary accent: **#1E1B4F** (deep navy)
- [ ] Primary purple: **#6366F1** (active states)
- [ ] Secondary purple: **#6E63E6** (bars)
- [ ] Soft purple: **#D8D6F8** (light bars)
- [ ] Light purple bar: **#C7C6E9** (muted)

### Status Colors
- [ ] Positive green: **#10B981**
- [ ] Negative red: **#EF4444**

### Text Colors
- [ ] Text primary: **#101828** (titles)
- [ ] Text secondary: **#0F172A** (metrics)
- [ ] Muted text: **#6B7280** (captions)

### Surface Colors
- [ ] Border surface: **#EEF2F6**
- [ ] Border card: **rgba(17,24,39,0.04)**
- [ ] Sidebar bg: **#FBFCFE**
- [ ] App bg: **#FFFFFF**
- [ ] Card bg: **#FFFFFF**

---

## 🔤 Typography Verification

### Font Family
- [ ] All text uses **Inter** font
- [ ] Font loads from Google Fonts
- [ ] Fallback fonts are configured

### Font Sizes & Line Heights
- [ ] 12px / 16px - Captions, delta labels
- [ ] 13px / 18px - Table cells
- [ ] 14px / 20px - Body text, nav items, card titles
- [ ] 16px / 24px - Chart titles
- [ ] 20px / 28px - Page title
- [ ] 28px / 32px - Metric numbers

### Font Weights
- [ ] 400 - Regular (body, captions)
- [ ] 500 - Medium (nav items)
- [ ] 600 - Semibold (titles, headings)
- [ ] 700 - Bold (metric numbers)

---

## 📏 Spacing Verification (8px Grid)

### Component Spacing
- [ ] Sidebar width: **240px** (30 × 8px)
- [ ] Topbar height: **64px** (8 × 8px)
- [ ] Logo area: **80px** (10 × 8px)
- [ ] Card padding: **20px** (closest to 24px/3 = practical)
- [ ] Card gaps: **24px** (3 × 8px)
- [ ] Page padding: **32px** (4 × 8px)
- [ ] Nav spacing: **18px** (closest practical to 16px)

### Margin & Padding
- [ ] All margins snap to 8px grid
- [ ] All padding uses 8px multiples where practical
- [ ] Gap utilities use 8px multiples

---

## 🎭 Shadow Verification

### Metric Cards
- [ ] Shadow: **0 2px 8px rgba(12,20,40,0.04)**
- [ ] Shadow is subtle and soft

### Main Cards
- [ ] Shadow: **0 6px 18px rgba(12,20,40,0.06)**
- [ ] Shadow is slightly more prominent than metrics

### Tooltips (for future implementation)
- [ ] Shadow: **0 8px 20px rgba(17,24,39,0.12)**

### Data Points (for future implementation)
- [ ] Shadow: **0 2px 6px rgba(30,27,79,0.12)**

---

## 🔘 Border Radius Verification

- [ ] Cards: **12px** (rounded-card)
- [ ] Pills: **8px** (rounded-pill)
- [ ] Buttons: **10px** (rounded-button)
- [ ] Avatar: **50%** (rounded-full)

---

## 🖱️ Interactive States

### Nav Items
- [ ] Hover state has subtle background
- [ ] Active state has purple background + border
- [ ] Transition is smooth (0.2s)
- [ ] Cursor changes to pointer

### Cards
- [ ] No hover state (static)
- [ ] Shadow remains consistent

---

## 📱 Browser DevTools Verification

### Using Chrome/Edge DevTools
1. [ ] Right-click sidebar → Inspect → Verify `width: 240px`
2. [ ] Right-click topbar → Inspect → Verify `height: 64px`
3. [ ] Right-click metric card → Inspect → Verify `width: 260px`, `height: 96px`
4. [ ] Right-click large chart → Inspect → Verify `width: 720px`, `height: 420px`
5. [ ] Right-click card → Inspect → Verify `padding: 20px`, `border-radius: 12px`
6. [ ] Check Computed tab for exact pixel values
7. [ ] Use ruler tool to measure gaps (should be 24px)
8. [ ] Verify colors in Styles panel match hex values

### Using Firefox DevTools
1. [ ] Use Layout tab to verify box model
2. [ ] Check exact dimensions in Computed panel
3. [ ] Verify colors in Rules panel

---

## 🎯 Visual Comparison

### Against Figma
- [ ] Sidebar width matches exactly
- [ ] Topbar height matches exactly
- [ ] Card dimensions match exactly
- [ ] Gaps between elements match exactly
- [ ] Colors match exactly (use color picker)
- [ ] Typography sizes match exactly
- [ ] Shadows are similar in appearance
- [ ] Border radius matches exactly

### Against Screenshot
- [ ] Overall layout proportions match
- [ ] Element positioning matches
- [ ] Color scheme matches
- [ ] Typography hierarchy matches

---

## 🔍 Pixel Measurement Guide

### How to Measure in Browser
1. Open DevTools (F12)
2. Select element
3. Check Computed tab
4. Look for:
   - Width
   - Height
   - Padding
   - Margin
   - Border
   - Border-radius

### Expected Measurements
```
Sidebar:
  width: 240px
  
Topbar:
  height: 64px
  
Metric Card:
  width: 260px
  height: 96px
  padding: 20px
  border-radius: 12px
  gap: 24px
  
Large Chart:
  width: 720px
  height: 420px
  
Medium Chart:
  width: 600px
  height: 420px
  
Small Chart:
  width: 360px
  height: 340px
```

---

## ✅ Final Verification

### Desktop (1440px)
- [ ] All elements fit within viewport
- [ ] No horizontal scrolling
- [ ] Vertical scrolling works smoothly
- [ ] All gaps are consistent
- [ ] All cards align properly

### Typography
- [ ] All text is readable
- [ ] Line heights are comfortable
- [ ] Font weights are correct
- [ ] Colors have good contrast

### Colors
- [ ] All colors match specification
- [ ] Contrast ratios are sufficient
- [ ] Active states are visible
- [ ] Muted text is still readable

### Spacing
- [ ] All spacing is consistent
- [ ] No awkward gaps
- [ ] Elements don't overlap
- [ ] Padding is uniform

---

## 🐛 Common Issues to Check

- [ ] No text overflow or truncation
- [ ] No layout shifts on load
- [ ] No console errors
- [ ] No missing fonts
- [ ] No broken styles
- [ ] No misaligned elements
- [ ] No incorrect colors
- [ ] No wrong dimensions

---

## 📝 Testing Notes

**Tester Name**: _______________  
**Date**: _______________  
**Browser**: _______________  
**Screen Resolution**: _______________  

**Issues Found**:
1. _______________
2. _______________
3. _______________

**Overall Status**: ⬜ Pass  ⬜ Fail  ⬜ Needs Review

---

## 🎯 Sign-Off

- [ ] All dimensions verified
- [ ] All colors verified
- [ ] All typography verified
- [ ] All spacing verified
- [ ] All shadows verified
- [ ] All border radius verified
- [ ] Visual comparison complete
- [ ] Browser DevTools verification complete

**Approved By**: _______________  
**Date**: _______________  
**Status**: ✅ Pixel-Perfect Implementation Verified
