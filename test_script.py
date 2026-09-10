
import urllib.request, re
try:
    js = urllib.request.urlopen('https://slack-sand-nu.vercel.app/_next/static/immutable/chunks/3-nt5_ym6ayr1.js').read().decode()
    idx = js.find('auth/signup')
    print('Snippet around auth/signup:')
    print(js[max(0, idx-400):idx+50])
except Exception as e:
    print(e)

