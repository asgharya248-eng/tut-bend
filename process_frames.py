import os, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

SRC = r"C:\tmp\web bend"
DST = r"C:\Users\PC\Documents\Default Project\bend-site\frames"
W, H = 1280, 720
Q = 82

def convert(name):
    src = os.path.join(SRC, name)
    dst = os.path.join(DST, name.rsplit(".", 1)[0] + ".webp")
    if os.path.exists(dst):
        return 0
    im = Image.open(src).convert("RGBA")
    im = im.resize((W, H), Image.LANCZOS)
    im.save(dst, "WEBP", quality=Q, method=4)
    return os.path.getsize(dst)

if __name__ == "__main__":
    os.makedirs(DST, exist_ok=True)
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(".png"))
    print(f"{len(files)} frames", flush=True)
    total = 0
    with ProcessPoolExecutor() as ex:
        for i, sz in enumerate(ex.map(convert, files)):
            total += sz
            if i % 25 == 0:
                print(f"{i}/{len(files)}", flush=True)
    print(f"DONE {len(files)} frames, total {total/1048576:.0f} MB", flush=True)
