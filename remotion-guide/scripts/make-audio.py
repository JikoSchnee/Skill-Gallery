import math, wave, struct, random
from pathlib import Path
random.seed(7)
SR=24000
root=Path(__file__).resolve().parents[1]/'public'/'audio'
def save(name, length, fun):
    data=[]
    for i in range(int(length*SR)):
        t=i/SR
        data.append(fun(t))
    peak=max(abs(x) for x in data) or 1
    with wave.open(str(root/name),'wb') as w:
        w.setparams((1,2,SR,0,'NONE','not compressed'))
        w.writeframes(b''.join(struct.pack('<h',int(x/peak*27000)) for x in data))
def music(t):
    beat=t%0.5; bar=int(t/2); chord=[[130.81,164.81,196],[110,130.81,164.81],[87.31,110,130.81],[98,123.47,146.83]][bar%4]
    # Rounded kick, soft offbeat noise hat, plucked arpeggio and warm chord bed.
    kick=math.sin(2*math.pi*(45*beat+4*(1-math.exp(-beat*35))))*math.exp(-beat*18)*.42
    hat=(random.random()*2-1)*math.exp(-(t%0.25)*110)*.055
    phase=t%0.25; note=chord[int(t*4)%3]*2
    pluck=(math.sin(2*math.pi*note*t)+.22*math.sin(4*math.pi*note*t))*math.exp(-phase*13)*.14
    pad=sum(math.sin(2*math.pi*f*t) for f in chord)*.025
    bass=math.sin(2*math.pi*chord[0]/2*t)*math.exp(-beat*5)*.16
    fade=min(1,t/1.5,max(0,(48-t)/2))
    return (kick+hat+pluck+pad+bass)*fade
save('pulse-120bpm.wav',48,music)
save('click.wav',.12,lambda t:math.sin(2*math.pi*1350*t)*math.exp(-t*65))
save('whoosh.wav',.45,lambda t:(random.random()*2-1)*math.sin(math.pi*t/.45)**2*.65+math.sin(2*math.pi*(400*t-300*t*t))*.1)
save('done.wav',.8,lambda t:(math.sin(2*math.pi*659.25*t)+math.sin(2*math.pi*987.77*t)*.5)*math.exp(-t*5)*min(1,t*150))
print('Generated 48s music + 3 effects at 24 kHz, peak normalized.')
