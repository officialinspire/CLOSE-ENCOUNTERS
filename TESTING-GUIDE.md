# CLOSE ENCOUNTERS - Testing & Verification Guide

## 🔍 Pre-Deployment Checklist

### File Verification
- [ ] index.html present
- [ ] styles.css present
- [ ] index.js present
- [ ] chicken.mp3 present in same directory
- [ ] cow.mp3 present in same directory
- [ ] tractor-beam.mp3 present in same directory
- [ ] ufo-flying.mp3 present in same directory
- [ ] startscreen.mp3 present in same directory

## 🎵 Sound Testing

### Start Screen
1. Load the game
2. **Expected**: startscreen.mp3 should play and loop
3. **Verify**: Music continues playing while on menu

### Game Sounds
1. Click "BEGIN MISSION"
2. **Expected**: startscreen.mp3 stops, ufo-flying.mp3 starts
3. **Verify**: UFO flying sound loops continuously

### Abduction Sounds
1. Tap/click on a chicken 🐔
2. **Expected**: 
   - chicken.mp3 plays
   - tractor-beam.mp3 plays simultaneously
3. Tap/click on a cow 🐄
4. **Expected**: 
   - cow.mp3 plays
   - tractor-beam.mp3 plays simultaneously
5. **Note**: Farmer abductions only play tractor-beam.mp3

### Game Over
1. Let altitude reach 0%
2. **Expected**: ufo-flying.mp3 stops
3. Click "TRY AGAIN"
4. **Expected**: ufo-flying.mp3 resumes

## 🎮 Gameplay Testing

### Initial Spawn
- [ ] 6 targets appear on screen (increased from 4)
- [ ] Targets include mix of cows, chickens, farmers
- [ ] Targets move left and right
- [ ] Targets bounce off screen edges

### Target Speed Verification
- [ ] Cows move at moderate speed (0.6)
- [ ] Chickens move faster than cows (1.4)
- [ ] Farmers move between cow and chicken speed (0.85)
- [ ] All targets visibly faster than v1.0

### Spawn Rate
- [ ] New targets spawn frequently during gameplay
- [ ] Can reach up to 12 targets on screen
- [ ] Spawn rate feels balanced (not too easy/hard)

### Abduction Mechanics
- [ ] Clicking/tapping target abducts it
- [ ] Specimen counter increases
- [ ] Weight bar fills appropriately
- [ ] Altitude decreases based on weight
- [ ] Combo multiplier activates after 2+ consecutive hits

### Weight Management
- [ ] Weight bar shows OPTIMAL (green) under 50%
- [ ] Weight bar shows WARNING (orange) 50-80%
- [ ] Weight bar shows CRITICAL (red, blinking) above 80%
- [ ] Cannot abduct when at max weight
- [ ] "TOO HEAVY" message appears if over capacity

### Trading System
- [ ] "TRADE SPECIMENS" button visible at bottom
- [ ] Trading converts specimens to currency
- [ ] Trading resets cargo weight to 0
- [ ] Trading resets specimen count to 0
- [ ] Currency amount displays correctly

### Shop System
- [ ] "SHOP" button opens upgrade modal
- [ ] 5 upgrades display correctly
- [ ] Current currency shows at top
- [ ] Affordable upgrades are at 100% opacity
- [ ] Unaffordable upgrades are at 50% opacity
- [ ] Clicking affordable upgrade purchases it
- [ ] Upgrade effect applies immediately
- [ ] Upgrade level increases [Lv.0] → [Lv.1]
- [ ] Cost increases after purchase

### Game Over
- [ ] Altitude reaching 0% triggers game over
- [ ] "MISSION FAILED" screen appears
- [ ] Final stats display correctly
- [ ] "TRY AGAIN" button restarts game
- [ ] Currency persists after restart
- [ ] Upgrades persist after restart

## 📱 Mobile Testing (Android)

### Touch Input
- [ ] Single tap activates tractor beam
- [ ] UFO follows finger position smoothly
- [ ] No lag or delay in touch response
- [ ] Multi-touch doesn't break game

### Screen Orientation
- [ ] Portrait mode works correctly
- [ ] Landscape mode works correctly
- [ ] Canvas resizes without breaking game
- [ ] UI elements remain visible in landscape

### Mobile-Specific Features
- [ ] No pull-to-refresh occurs during gameplay
- [ ] No context menu on long press
- [ ] Full-screen mode available
- [ ] Status bar hidden/styled
- [ ] No bouncing/elastic scrolling

### Performance
- [ ] Smooth 60fps gameplay
- [ ] No frame drops during intense action
- [ ] Sounds play without crackling
- [ ] No memory leaks after long sessions

## 📱 Mobile Testing (iPhone/Safari)

### iOS-Specific
- [ ] Game fills entire screen (including notch area)
- [ ] Status bar styled correctly
- [ ] No height calculation issues
- [ ] Touch events respond immediately
- [ ] Sounds play on user interaction

### Safari Compatibility
- [ ] Canvas renders correctly
- [ ] Webkit backdrop filters work
- [ ] All animations smooth
- [ ] Font rendering correct
- [ ] No visual glitches

## 💻 Desktop Testing

### Browser Compatibility

#### Chrome
- [ ] All features work
- [ ] Sounds play correctly
- [ ] Smooth performance
- [ ] UI displays properly

#### Firefox
- [ ] All features work
- [ ] Sounds play correctly
- [ ] Canvas rendering correct
- [ ] No console errors

#### Safari
- [ ] All features work
- [ ] Sounds play correctly
- [ ] Webkit-specific CSS works
- [ ] Smooth animations

#### Edge
- [ ] All features work
- [ ] Performance good
- [ ] UI displays correctly

### Mouse Input
- [ ] Click and hold works
- [ ] UFO follows cursor smoothly
- [ ] Multiple rapid clicks handled
- [ ] No stuttering or lag

### Window Resizing
- [ ] Canvas resizes with window
- [ ] Game continues without breaking
- [ ] UI elements reposition correctly
- [ ] UFO stays within bounds

## 🐛 Bug Testing

### Common Issues to Check
- [ ] No console errors on load
- [ ] No console errors during gameplay
- [ ] No memory leaks (check DevTools)
- [ ] All images/emojis render
- [ ] All fonts load correctly
- [ ] No broken CSS
- [ ] No JavaScript errors

### Edge Cases
- [ ] Clicking outside canvas doesn't break game
- [ ] Rapid clicking handled properly
- [ ] Opening shop during gameplay doesn't break game
- [ ] Trading with 0 specimens handled
- [ ] Buying upgrade with exact currency amount works
- [ ] Restarting during combo works correctly

## ⚖️ Balance Testing

### Gameplay Feel
- [ ] Can collect enough specimens between trades
- [ ] Have enough currency for upgrades
- [ ] Game isn't too easy (doesn't last forever)
- [ ] Game isn't too hard (can make progress)
- [ ] Combos feel rewarding
- [ ] Weight management adds strategy

### Progression
- [ ] First upgrade purchasable within 2-3 minutes
- [ ] Multiple upgrades achievable in single session
- [ ] Upgrades feel impactful
- [ ] Game difficulty scales appropriately

## 📊 Performance Benchmarks

### Target Metrics
- [ ] 60 FPS on desktop (check DevTools)
- [ ] 50+ FPS on mobile
- [ ] < 100ms input latency
- [ ] < 200ms sound playback delay
- [ ] < 50MB memory usage

### Load Times
- [ ] Page loads in < 2 seconds
- [ ] Audio files load in < 3 seconds
- [ ] No "waiting for audio" delays
- [ ] Smooth start screen animation

## ✅ Final Verification

### Before Going Live
1. [ ] All sounds tested and working
2. [ ] Gameplay balance feels good
3. [ ] No console errors
4. [ ] Tested on at least 3 devices
5. [ ] Tested on at least 2 browsers
6. [ ] Mobile experience smooth
7. [ ] Desktop experience smooth
8. [ ] All UI elements clickable/tappable
9. [ ] README.md complete
10. [ ] Audio files properly attributed

### Deployment Ready
- [ ] All files in same directory
- [ ] File names match exactly (case-sensitive)
- [ ] No hardcoded paths
- [ ] Relative URLs used
- [ ] Tested on live server (not file://)

## 🎯 Post-Deployment Testing

### After Upload to GitHub Pages
1. Load game on live URL
2. Test all sounds (may need HTTPS)
3. Test on different devices
4. Check console for any new errors
5. Verify all features work as expected

## 📝 Testing Log Template

```
Date: _______________
Tester: _______________
Device: _______________
Browser: _______________

✅ = Pass | ❌ = Fail | ⚠️ = Issue

Sound System:        ___
Gameplay Balance:    ___
Mobile Touch:        ___
Desktop Mouse:       ___
UI/UX:               ___
Performance:         ___

Notes:
____________________________
____________________________
____________________________

Issues Found:
____________________________
____________________________
____________________________
```

## 🚀 Ready to Launch!

Once all items are checked, your game is ready for deployment. Good luck with your alien abduction missions! 🛸👽

---

**Remember**: Test on actual devices, not just browser dev tools. Mobile behavior can differ significantly!
