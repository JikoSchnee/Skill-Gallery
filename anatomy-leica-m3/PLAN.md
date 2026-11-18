# Leica M3 — staged reconstruction

Approved subject: late single-stroke M3 + rigid Summicron 50mm f/2. Monochrome line drawing of true 3D geometry. No frontend-design skill.

## Review gates
1. Exterior, proportions, line rendering, orbit and orthographic inspection. Stop for user review.
2. User-approved corrections, then separately model the documented internal assemblies and sectional/exploded layout. Stop for review.
3. Only after layout approval: film advance, shutter, rewind and lens interactions.

## Evidence and limits
- Leitz 1960 M3 leaflet: https://www.summilux.net/documents/DepliantM3.pdf
- Leitz 1961 brochure: https://www.summilux.net/documents/LeicaM3.pdf
- Matching 1960 single-stroke body and rigid 50mm Summicron: https://www.leitz-auction.com/de/Leica-M3-chrome-Single-Stroke/A00455
- Original instruction manual: https://www.cameramanuals.org/leica_pdf/leica_m3-03.pdf
- Reference descriptions were accessible. High-resolution gallery browser access and local PDF download were blocked by an approval-service capacity error. PDF screenshots did not yield inspectable images. Do not claim photograph-by-photograph verification.
- Envelope uses 138 mm body width and an approximately 77 mm height; 33.5 mm is the shell-depth working assumption, excluding lens and protruding controls. Local features are proportional reconstructions, NOT factory CAD measurements or a scan. Exact late-M3 year/sub-variant, lettering and lens profile require further photographic verification.

## Exterior parts, before geometry
Body: main chassis envelope, bottom plate, bottom lip, top cover, top lip, front covering seam, rear covering seam, left covering seam, right covering seam, rear door, hinge spine, five hinge knuckles, hinge pin, bottom lock plinth, bottom lock dial, lock handle, tripod surround, tripod socket, four bottom screws, left strap mounting boss, right strap mounting boss, two strap eyes.

Front: rangefinder outer bezel/inner bezel/window, illumination outer bezel/inner bezel/window and flutes, viewfinder outer bezel/inner bezel/window, rewind-release hub/arm, self-timer base/lever/end pad/retainer, frame-preview hub/lever/end, lens release collar/button, bayonet flange/seat and five fasteners.

Top: rewind plinth/stem/knurled knob/cap/axis/two index marks; speed-dial foot/drum/rim/cap/ticks; advance pivot/plinth/arm/finger end; shutter collar/cup/thread opening; counter surround/window/index; accessory-shoe base/left rail/right rail/front stop/two screws; model and maker engravings.

Back: viewfinder eyepiece collar/thread surround/glass, two flash-port surrounds/insulators/sockets, film-reminder surround/disc/inner dial/retainer, rear-door upper and lower lips.

Lens: bayonet collar, mounting seat, distance barrel, focusing scallops, focus ring edge pair, depth-of-field band, central barrel, aperture ring, aperture knurls, front retaining collar, front lip, internal bevel, recessed front element perimeter, retaining ring pair, focus lock stem/button, scale ticks and engravings. The lens element is an exterior contour only in stage 1, not a claim of a complete optical prescription.

## Rendering
Three.js already installed by the existing project provides the orbitable mesh and depth buffer. Anatomy guides physical part separation, details, line hierarchy and occlusion. User's pure-line request overrides the skill's tonal shading. White occluding solids + black contour hulls + selected geometric edges; no triangle wireframe, materials, lighting gradients or coloured axes. Render on demand.

## Checks
Per user AGENTS instruction, smoke checks only: page load, browser console, orbit/zoom, named views, desktop/mobile fit, and visible outline review. No claim of a manufacturing-tolerance or mechanical-clearance audit in stage 1.

Stage 1 smoke check, 2026-10-30: syntax checks passed; local page loaded in the in-app browser; front/top/rear/bottom views inspected; pointer orbit, keyboard zoom and reset exercised; 390×844 layout inspected; browser error/warning log empty. Fixed contour-hull depth-writing speckle and moved the resting advance lever clear of the shutter-speed dial. Screenshot: `shots/stage-01.jpg`. Headless Chrome could not start in the sandbox, so actual visual smoke checks used the in-app browser instead.

Preview: http://127.0.0.1:5173/demos/leica-m3/index.html
Build: `node anatomy-leica-m3/build.mjs` (also called by the gallery's existing anatomy sync during the normal build).
Status: exterior and internal layout approved; stage 3 mechanical linkage implemented and awaiting review.

## Stage 2 — approved exterior; internal layout only
User approved the exterior on 2026-10-30. Preserve monochrome appearance and stop again before mechanical linkage.

The original M3 service manual is now downloaded and inspected: https://phsc.ca/repair/Leitz/leica_camera_m3.pdf (173 PDF pages). Relevant parts sheets inspected include PDF pp. 41 (rear door and pressure plate), 47 (rangefinder assembly), 53 (single-stroke winding/counter), 59 (release/frameline linkage), 68 (speed selector; adjacent serial revisions are not interchangeable), 75 (early transport shaft; topology only), 94 (late shutter curtains) and 102 (late shutter chassis). Early-version diagrams must not be treated as exact late-version manufacturing drawings.

Additional optical context: Erwin Puts, Leica Lens Compendium, section 6.3.9, https://125px.com/docs/manuals/lenses/35mm/rangefinder/leica/llcforweb.pdf . Optical surface curvature and spacing in this model are illustrative, not a recovered optical prescription.

Static assembly plan (before geometry):
- Chassis: hollow shell, open film-gate frame, 36×24 aperture, upper/lower guide rails, lens throat, supporting side plates and posts. The exterior envelope must not remain a solid block over the internals.
- Film transport: cartridge shell/spindle/end caps/slit, removable take-up spool/core/flanges/clamp, sprocket spindle/two sprocket crowns, perforated 35mm film strip, pressure plate/two spring clips. Film and pressure plate have an independent inspection toggle.
- Shutter: winding drum, two spring rollers, two cloth curtains, ribbon pairs, curtain edge bars, drum bushings, tension caps and support bridge. These are static shapes, not a simulated shutter cycle.
- Winding/release: advance spindle, clutch, ratchet, pawl, return spring, winding plate, counter disc/index, speed cam, supporting bridge, release plunger, slow-speed module outline and self-timer wheel pack. Gear teeth and the local escapement are explicitly simplified; no exact tooth counts or calibrated speeds claimed.
- Finder: open carrier, objective frame, eyepiece frame, rangefinder entrance reflector, transverse optical channel, combining prism, frameline mask/condenser, follower arm/roller, spring and adjustment mounts. Prism shapes and exact optical paths are a layout reconstruction.
- Lens: seven individually modelled illustrative optical elements in six cells, separation rings, diaphragm carrier/blade outlines, focusing helicoid and cam sleeve. Cemented pair stays together when assemblies separate.

Inspection only: complete exterior / lower-shell cutaway / no exterior, isolate an assembly, static spread slider, hide film and pressure plate. These operations preserve the current camera. No firing, winding, rewind or automatic animation controls in this stage.

Stage 2 smoke check, 2026-10-30: JavaScript syntax and demo build passed; six assembly views and static spread inspected; shell, assembly and spread changes preserve camera state; full exterior restores correctly; browser console clean. Desktop and 390×844 layouts inspected. Closed white section caps added to exterior cuts and half lens cells to prevent backface wedges and stray section lines. Gear teeth, prism geometry and lens curvature remain layout-level approximations, not manufacturing or optical validation.

Review preview: http://127.0.0.1:5173/demos/leica-m3/index.html?revision=2
Review screenshot: `shots/stage-02-review.jpg`. Additional assembly and mobile screenshots are in `shots/stage-02-*.png`.
Stage 2 gate approved by user; proceed to the mechanical linkage described below.

## Stage 3 — mechanical linkage
User approved the internal layout. Couple advance lever, clutch, transport sprocket, take-up spool, counter and curtain cocking; release button/plunger drive sequential cloth curtains; R lever and raised rewind knob drive reverse film transport. Use one deterministic time-based state model; preserve camera and inspection settings. Pause/resume and mechanism-only reset are explicit. Spread layouts must be gathered before running. Motion timing, winding angles and spool radii are explanatory approximations, not calibrated factory kinematics. Reference: Leitz M3 instruction manual, https://125px.com/docs/manuals/camera/35mm/leica/leica_m3_manual.pdf ; service sheets already listed above. Keep optical group and speed dial stationary during shutter operation.

Stage 3 smoke check, 2026-10-30: advance → pause/resume → shutter → rewind → mechanism reset passed in local Chrome, with camera state retained. Verified double-advance/double-release interlocks, stationary film during shutter travel, sequential curtain slit, reverse film transport with disengaged winding drive, retained counter after rewind, spread interlock and shell changes during a paused action. 390×844 layout has no horizontal overflow; reduced-motion actions settle directly to the correct state. Console clean. Visual exterior check corrected lever sweep away from speed dial and extended rewind stem under the raised knob. No full mechanical-tolerance audit.

Stage 3 preview: http://127.0.0.1:5173/demos/leica-m3/index.html?revision=3 . Pure white occlusion surfaces and black lines are preserved. Reset mechanism does not reset camera, shell or assembly selection. Waiting for user review before further additions.
