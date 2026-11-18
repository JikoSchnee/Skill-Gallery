"""Render a front-facing delivery preview from the generated Blender scene."""
import bpy, sys
from pathlib import Path
root=Path(sys.argv[sys.argv.index('--')+1]).resolve()
bpy.ops.wm.open_mainfile(filepath=str(root/'card.blend'))
pivot=bpy.data.objects['转卡控制 · 播放时间线预览']
pivot.animation_data_clear()
pivot.rotation_euler=(0,0,0)
bpy.context.scene.render.filepath=str(root/'renders'/'front.png')
if '--angled-only' not in sys.argv:
    bpy.ops.render.render(write_still=True)

# A second angle makes physical thickness and view-dependent foil inspectable.
pivot.rotation_euler=(0.08,0,0.28)
bpy.context.scene.render.filepath=str(root/'renders'/'angled.png')
bpy.ops.render.render(write_still=True)
