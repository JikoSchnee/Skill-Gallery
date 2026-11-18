import bpy,sys
from pathlib import Path
root=Path(sys.argv[sys.argv.index('--')+1]).resolve()
bpy.ops.wm.open_mainfile(filepath=str(root/'card.blend'))
scene=bpy.context.scene
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.8,.82,.76,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7
for mat in bpy.data.materials:
 if '金' in mat.name:
  mat.diffuse_color=(.7,.74,.66,1)
  if mat.use_nodes:
   for node in mat.node_tree.nodes:
    if node.type=='BSDF_PRINCIPLED':
     node.inputs['Base Color'].default_value=(.7,.74,.66,1)
     node.inputs['Metallic'].default_value=0
pivot=bpy.data.objects['转卡控制 · 播放时间线预览'];pivot.animation_data_clear();pivot.scale.x=(370/535)/(6.3/9.45)
scene.render.resolution_x=740;scene.render.resolution_y=1070;scene.cycles.samples=16
scene.view_settings.view_transform='AgX'
scene.view_settings.exposure=-1
for mat in bpy.data.materials:
 if mat.use_nodes:
  for n in mat.node_tree.nodes:
   if n.type=='BSDF_PRINCIPLED':
    n.inputs['Metallic'].default_value=0
    n.inputs['Roughness'].default_value=1
   if n.type=='EMISSION': n.inputs['Strength'].default_value=min(n.inputs['Strength'].default_value,0.2)
scene['素材来源']='Existing SVG cover and current card typography rasterized into registered layers; no new generated illustration.'
pivot.rotation_euler=(0,0,0)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'card.blend'))
for name,angle in [('front',(0,0,0)),('angled',(.08,0,.25))]:
 pivot.rotation_euler=angle
 scene.render.filepath=str(root/'renders'/(name+'.png'))
 bpy.ops.render.render(write_still=True)
