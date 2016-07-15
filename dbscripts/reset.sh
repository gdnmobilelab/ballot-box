#!/bin/bash
FILES="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/p_*.sql"
for f in $FILES
do
  # take action on each file. $f store current file name
  mysql -u root ballotbox < $f
done


POLL_FILES="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/polls/p_*.sql"
for f in $POLL_FILES
do
  # take action on each file. $f store current file name
  mysql -u root ballotbox < $f
done


QUIZ_FILES="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/quizzes/p_*.sql"
for f in $QUIZ_FILES
do
  # take action on each file. $f store current file name
  mysql -u root ballotbox < $f
done
