"""Fail closed if the APK lacks any locally built game resource or references a remote server."""
import hashlib,json,sys,zipfile
from pathlib import Path
apk=Path(sys.argv[1]);root=Path('dist-native')
with zipfile.ZipFile(apk) as z:
 assert z.testzip() is None
 config=json.loads(z.read('assets/capacitor.config.json'));assert config['appId']=='com.hayoo74.lifestory'
 assert not config.get('server',{}).get('url'),'remote-hosted game is forbidden'
 checked=0
 for p in root.rglob('*'):
  if p.is_file():assert z.read('assets/public/'+p.relative_to(root).as_posix())==p.read_bytes(),str(p);checked+=1
 assert checked>5
 print(json.dumps({'apk':apk.name,'size':apk.stat().st_size,'sha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'embedded_files_verified':checked,'zip_integrity':True,'remote_server':False},indent=2))
