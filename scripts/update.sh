# echo "WOP" > /tmp/pvinis-commits-data.json
cp README.md.tmpl README.md
npx template-file /tmp/pvinis-commits-data.json README.md.tmpl .
git add README.md
git commit -m "fresh bad words"
