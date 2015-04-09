#!/bin/sh
set -e
if [ ! ${1} ]; then
  # See if we have a bin/access_token file and if do, source it.
  # Contents of the access_token should be: ACCESS_TOKEN="access_token_here"
  if [ -f $(dirname $0)/access_token ]; then
    . $(dirname $0)/access_token
  fi
  if [ -z $ACCESS_TOKEN ]; then
    echo "Usage: $0 [access_token]"
    exit 1
  fi
else
  ACCESS_TOKEN="${1}"
fi

cat /dev/null > tmp.json
echo "Getting last 400 activites... \c"
for PAGE in 1 2; do
  curl -s -G "https://www.strava.com/api/v3/athlete/activities?access_token=${ACCESS_TOKEN}&per_page=200&page=${PAGE}" >> tmp.json
  echo "Pg${PAGE} \c"
done
echo "DONE"
cat tmp.json | sed 's/\]\[/,/g' > $(dirname $0)/../data/year-o-entries.json
rm tmp.json
