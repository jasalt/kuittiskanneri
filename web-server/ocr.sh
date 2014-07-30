#!/bin/bash

# Ensimmäinen parametri on kuvatiedosto

# Set tessdata parent directory
export TESSDATA_PREFIX=/root/dev/tess_source/tesseract-ocr/


#TEMP=$(mktemp /tmp/temporary-file.XXXXXXXX)

BASE=/tmp/tesstemp_$$
PIPE=$BASE.txt

rm -f $PIPE
mkfifo $PIPE
# Run tesseract in background and redirect output to tess_out.txt
tesseract -l fin $1 $BASE nobatch kuitti > tess_out.txt 2>&1 &
cat $PIPE
rm -f $PIPE

