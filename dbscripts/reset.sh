#!/bin/bash
FILES="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/p_*.sql"
for f in $FILES
do
  # take action on each file. $f store current file name
  mysql -u root ballotbox < $f
done
