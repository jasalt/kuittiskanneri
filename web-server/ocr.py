import os
import subprocess
import autocorrect
import receiptparser

UPLOAD_FOLDER = 'uploads/'
OCR_SCRIPT = './ocr.sh'

def optical_character_recognition(imagepath):
    """ Does OCR on an image and returns tuple: (raw text, autocorrected text, parsed receipt data) 
    
    imagepath: path to image to be processed
    """
    # Process image with ImageMagick
    processed_imagepath = os.path.join(UPLOAD_FOLDER, 'temp.png')

    print "Make image more readable"
    im_proc = subprocess.Popen(['convert',imagepath,'-resize','600x800',
                                '-blur','2','-lat','8x8-2%',processed_imagepath],
                                stdout=subprocess.PIPE)
    im_proc.communicate()

    # Read receipt with Tesseract
    print "Running OCR"
    image_text = ""
    proc = subprocess.Popen([OCR_SCRIPT, processed_imagepath],
                            stdout=subprocess.PIPE)
    
    for line in iter(proc.stdout.readline, ''):
        image_text += line.rstrip() + '\n'

    image_text = image_text.decode('utf-8')

    # Autocorrect
    
    
    print "Autocorrecting text"
    corrected_text = autocorrect.correct_text_block(image_text)

    if corrected_text is unicode:
         corrected_text = corrected_text.encode('utf-8')
    
    print "Parsing text"
    parsed_text = receiptparser.parse_receipt(corrected_text)

    return (image_text,
            corrected_text,
            parsed_text)
