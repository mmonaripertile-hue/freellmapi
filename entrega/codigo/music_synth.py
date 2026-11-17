# Trilha instrumental leve (eletrônica minimalista, 117 BPM, Ré menor) gerada por código
import numpy as np, sys
from scipy.signal import butter, sosfilt
import soundfile as sf
SR=44100; BPM=117; B=60/BPM; BAR=4*B
DUR=float(sys.argv[2]); N=int(DUR*SR)
L=np.zeros(N); Rr=np.zeros(N)
rng=np.random.default_rng(7)
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
def add(buf,x,t,g=1.0):
    i=int(t*SR); 
    if i>=N: return
    j=min(N,i+len(x)); buf[i:j]+=x[:j-i]*g
def st(x,t,g,pan=0.0): add(L,x,t,g*np.sqrt(.5*(1-pan))*1.414); add(Rr,x,t,g*np.sqrt(.5*(1+pan))*1.414)
mf=lambda m:440*2**((m-69)/12)
def env(n,a,d,sus=0.0,rel=None):
    t=np.arange(n)/SR; e=np.minimum(1,t/max(a,1e-4))*np.exp(-np.maximum(0,t-a)/d)
    return e
# acordes: Dm Bb F C  (raízes MIDI)
CH=[(38,[62,65,69]),(34,[62,65,70]),(41,[60,65,69]),(36,[60,64,67])]
nb=int(DUR/BAR)+2
kick_times=[]
for b in range(nb):
    t0=b*BAR; root,ch=CH[b%4]; full=b>=1
    # pad
    n=int(BAR*SR); tt=np.arange(n)/SR
    pad=sum(np.sin(2*np.pi*mf(m)*tt*(1+dt))+.5*np.sin(4*np.pi*mf(m)*tt*(1+dt)) for m in ch for dt in(-.003,.003))
    pe=np.minimum(1,tt/.35)*np.minimum(1,(BAR-tt)/.3)
    st(lp(pad*pe,1800),t0,.018,pan=-.2)
    # pluck nos contratempos
    for k,beat in enumerate([0.5,1.5,2.5,3.0,3.5]):
        n=int(.45*SR); tt=np.arange(n)/SR; m=ch[k%3]+12 if k in(2,4) else ch[k%3]
        sw=2*((tt*mf(m))%1)-1
        p=lp(sw*env(n,.004,.12),2600)
        st(p,t0+beat*B,.06,pan=.35 if k%2 else -.35)
    if not full: continue
    # baixo
    for beat,dur,oc in [(0,1.4,0),(1.5,.4,0),(2,1.4,0),(3.5,.4,12)]:
        n=int(dur*B*SR); tt=np.arange(n)/SR; f=mf(root+oc)
        bs=np.sin(2*np.pi*f*tt)+.25*np.sin(4*np.pi*f*tt)
        e=np.minimum(1,tt/.01)*np.minimum(1,(n/SR-tt)/.04)
        st(np.tanh(1.4*bs*e),t0+beat*B,.11)
    # bumbo 1 e 3 (+ fantasma no "e" do 4 a cada 2 compassos)
    for beat in [0,2]+([3.5] if b%2 else []):
        n=int(.3*SR); tt=np.arange(n)/SR; f=45+80*np.exp(-tt/.035)
        kk=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt/.12)
        st(kk,t0+beat*B,.42 if beat!=3.5 else .22); kick_times.append(t0+beat*B)
    # palma suave 2 e 4
    for beat in [1,3]:
        n=int(.2*SR); tt=np.arange(n)/SR; nz=rng.standard_normal(n)
        c=sosfilt(butter(2,[900,3500],'band',fs=SR,output='sos'),nz)*np.exp(-tt/.06)
        st(c,t0+beat*B,.10)
    # chimbal em colcheias (mais forte no contratempo)
    for e8 in range(8):
        n=int(.06*SR); tt=np.arange(n)/SR
        h=hp(rng.standard_normal(n),7000)*np.exp(-tt/.018)
        st(h,t0+e8*B/2,.05 if e8%2 else .022,pan=.25)
# pump leve do bumbo no pad/baixo (sidechain simples)
g=np.ones(N); tt=np.arange(int(.25*SR))/SR; dip=1-.35*np.exp(-tt/.08)
for kt in kick_times:
    i=int(kt*SR); j=min(N,i+len(dip)); g[i:j]=np.minimum(g[i:j],dip[:j-i])
L*=g; Rr*=g
# fade in/out
fi=np.minimum(1,np.arange(N)/(.4*SR)); fo=np.minimum(1,(N-np.arange(N))/(2.0*SR))
L*=fi*fo; Rr*=fi*fo
x=np.stack([L,Rr],1); x/=np.max(np.abs(x))*1.12
sf.write(sys.argv[1],x,SR)
print('ok', DUR, 'rms db', 20*np.log10(np.sqrt(np.mean(x**2))))
