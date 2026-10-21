"""Package the already-built plugin and a clean source archive; requires Python 3."""
from pathlib import Path
import json, shutil, zipfile
root=Path(__file__).resolve().parent.parent
version=json.loads((root/'manifest.json').read_text())['version']
out=root/'dist'; plugin=out/'bujo-lineage'
plugin.mkdir(parents=True,exist_ok=True)
for name in ['main.js','manifest.json','styles.css','LICENSE','UPSTREAM.md','README.md']:
    shutil.copy2(root/name,plugin/name)
# Include the documents linked by the install README as well.
for name in ['docs','sample-vault']:
    shutil.copytree(root/name,plugin/name,dirs_exist_ok=True)
with zipfile.ZipFile(out/f'bujo-lineage-{version}.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(plugin.rglob('*')):
        if p.is_file():z.write(p,p.relative_to(out))
allowed={'.github','src','tests','scripts','docs','sample-vault'}
files={'README.md','LICENSE','UPSTREAM.md','package.json','package-lock.json','manifest.json','styles.css','tsconfig.json','esbuild.config.mjs','version-bump.mjs','versions.json','.eslintrc','.gitignore','CHANGELOG.md'}
with zipfile.ZipFile(out/f'bujo-lineage-source-{version}.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(root.rglob('*')):
        rel=p.relative_to(root)
        if p.is_file() and (rel.parts[0] in allowed or str(rel) in files) and '__pycache__' not in rel.parts:
            z.write(p,Path('bujo-lineage')/rel)
print(plugin)
print(out/f'bujo-lineage-{version}.zip')
print(out/f'bujo-lineage-source-{version}.zip')
